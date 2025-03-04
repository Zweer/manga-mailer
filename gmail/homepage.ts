import { Manga } from '../data/manga.interface';

interface MangaDb {
  mangas: Manga[];
}

type UserData = Record<string, { lastReadChapter: number }>;

const mangaDbUrl =
  'https://raw.githubusercontent.com/Zweer/manga-mailer/refs/heads/main/data/mangas.json';

function getUserData(): UserData {
  const jsonString = PropertiesService.getUserProperties().getProperty('userData');
  if (!jsonString) {
    return {};
  }

  return JSON.parse(jsonString) as UserData;
}

export function mangaHomepageDraft() {
  const data = UrlFetchApp.fetch(mangaDbUrl);
  const mangaDb: MangaDb = JSON.parse(data.getContentText());
  const user = getUserData();

  const card = CardService.newCardBuilder();

  const mangas = mangaDb.mangas
    .map((manga) => {
      const userManga = user[manga.id];
      return {
        ...manga,
        isRead: userManga ? manga.lastReadChapter <= userManga.lastReadChapter : false,
      };
    })
    .sort((mangaA, mangaB) => {
      if (mangaA.isRead && !mangaB.isRead) {
        return 1;
      }
      if (!mangaA.isRead && mangaB.isRead) {
        return -1;
      }

      return mangaA.title!.localeCompare(mangaB.title!);
    });

  card.addSection(
    createListSection(
      'Unread',
      mangas.filter((manga) => !manga.isRead),
    ),
  );

  return card.build();
}

function createListSection(title: string, mangas: Manga[]) {
  const section = CardService.newCardSection().setHeader(title);
  mangas.forEach((manga) => {
    const button = CardService.newDecoratedText()
      .setText(manga.title!)
      .setOnClickAction(
        CardService.newAction().setFunctionName('mangaDetails').setParameters({ id: manga.id }),
      );

    section.addWidget(button);
  });

  return section;
}

export function mangaDetails(event: GoogleAppsScript.Addons.CommonEventObject) {
  const { id } = event.parameters;
  const data = UrlFetchApp.fetch(mangaDbUrl);
  const mangaDb: MangaDb = JSON.parse(data.getContentText());
  const user = getUserData();

  const manga = mangaDb.mangas.find((manga) => manga.id === id)!;
  const userManga = user[id];

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle(manga.title!))
    .addSection(
      CardService.newCardSection().addWidget(
        CardService.newDecoratedText().setText(`Last read chapter: ${userManga?.lastReadChapter}`),
      ),
    )
    .addSection(
      CardService.newCardSection().addWidget(
        CardService.newDecoratedText().setText(`Last chapter: ${manga.lastReadChapter}`),
      ),
    )
    .addSection(
      CardService.newCardSection().addWidget(
        CardService.newDecoratedText().setText(`Link: ${manga.link}`),
      ),
    );

  return card.build();
}
