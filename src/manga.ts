import { ConnectorNames, connectors } from '../lib/connectors';
import { Manga } from '../lib/interfaces/manga';

import { getUserMangas, putUserManga } from './lib/db';

interface MangaAutocomplete {
  connector: {
    name: ConnectorNames;
    initials: string;
  };
  id: string;
  title: string;
  chaptersCount: number;
}

interface MangaSave {
  connector: ConnectorNames;
  id: string;
  title: string;
  chaptersCount: number;
  readChapters: number;
}

function mangaHomepage() {
  const mangas = getUserMangas();
  console.log('mangas:', mangas);

  let card = CardService.newCardBuilder().setHeader(
    CardService.newCardHeader().setTitle('Manga @ Mail'),
  );

  if (mangas.length !== 0) {
    const mangaListSection = CardService.newCardSection().setHeader('Your Mangas');
    mangas.forEach(({ connector, manga, readChapters }) => {
      const link = CardService.newDecoratedText()
        .setText(`${manga.title} (${manga.chaptersCount})`)
        .setOnClickAction(
          CardService.newAction()
            .setFunctionName('showManga')
            .setParameters({
              connector,
              manga: JSON.stringify(manga),
              readChapters: JSON.stringify(readChapters),
            }),
        );

      if (manga.chaptersCount > readChapters.length) {
        link
          .setBottomLabel(`New chapters: ${manga.chaptersCount - readChapters.length}`)
          .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.EMAIL));
      }

      mangaListSection.addWidget(link);
    });
    card = card.addSection(mangaListSection);
  }

  card = card.addSection(
    CardService.newCardSection().addWidget(
      CardService.newTextButton()
        .setText('Add Manga')
        .setOnClickAction(CardService.newAction().setFunctionName('showAddMangaForm')),
    ),
  );

  return card.build();
}

function showAddMangaForm() {
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Add Manga'))
    .addSection(
      CardService.newCardSection()
        .addWidget(CardService.newTextInput().setFieldName('mangaName').setTitle('Manga Name'))
        .addWidget(
          CardService.newTextButton()
            .setText('Search')
            .setOnClickAction(CardService.newAction().setFunctionName('searchManga')),
        ),
    )
    .build();
  return card;
}

function searchManga(event: { formInput: { mangaName: string } }) {
  console.log('event:', event);

  const mangaName = event.formInput.mangaName.toLowerCase()!;
  const matchingMangas = connectors
    .reduce((mangas, connector) => {
      const newMangas = connector.getMangas(mangaName);

      mangas.push(
        ...newMangas.map((manga) => ({
          connector: { name: connector.name as ConnectorNames, initials: connector.initials },
          id: manga.id,
          title: manga.title,
          chaptersCount: manga.chaptersCount,
        })),
      );

      return mangas;
    }, [] as MangaAutocomplete[])
    .sort((mangaA, mangaB) => {
      if (mangaA.title.localeCompare(mangaB.title) === 0) {
        return mangaA.chaptersCount - mangaB.chaptersCount;
      }
      return mangaA.title.localeCompare(mangaB.title);
    });

  const selectionInput = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setFieldName('mangaDropdown')
    .setTitle('Matching Mangas');

  matchingMangas.forEach((manga) => {
    selectionInput.addItem(
      `[${manga.connector.initials}] ${manga.title} (${manga.chaptersCount})`,
      `${manga.connector.name}:${manga.id}`,
      false,
    );
  });

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Search Result'))
    .addSection(
      CardService.newCardSection()
        .addWidget(selectionInput)
        .addWidget(
          CardService.newTextButton()
            .setText('Select')
            .setOnClickAction(
              CardService.newAction().setFunctionName('selectManga').setParameters({ mangaId: '' }),
            ),
        ),
    )
    .build();
  return card;
}

function selectManga(event: any) {
  const mangaConnectorId = event.formInput.mangaDropdown;
  if (mangaConnectorId) {
    const [connectorName, mangaId] = mangaConnectorId.split(':');
    const manga = connectors
      .find((connector) => connector.name === connectorName)!
      .getManga(mangaId);

    putUserManga({
      connector: connectorName as ConnectorNames,
      manga,
      readChapters: [],
    });
  }

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Manga Selected'))
    .addSection(
      CardService.newCardSection()
        .addWidget(CardService.newTextParagraph().setText('Manga has been added to your list.'))
        .addWidget(
          CardService.newTextButton()
            .setText('Back to Home')
            .setOnClickAction(CardService.newAction().setFunctionName('mangaHomepage')),
        ),
    )
    .build();
  return card;
}

function getParameters(event: any): {
  connector: ConnectorNames;
  manga: Manga;
  readChapters: number[];
} {
  const connector: ConnectorNames = event.parameters.connector;
  console.log('connector:', connector);
  const manga: Manga = JSON.parse(event.parameters.manga);
  console.log('manga:', manga);
  const readChapters: number[] = JSON.parse(event.parameters.readChapters ?? '[]');
  console.log('readChapters:', readChapters);

  return { connector, manga, readChapters };
}

function showManga(event: any) {
  const { connector, manga, readChapters } = getParameters(event);

  const chapters = CardService.newCardSection().setHeader('Chapters');
  manga.chapters.forEach((chapter) => {
    const link = CardService.newDecoratedText()
      .setText(`Chapter ${chapter.index}`)
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName('showChapter')
          .setParameters({
            connector,
            manga: JSON.stringify(manga),
            chapter: chapter.index.toString(),
          }),
      );
    if (!readChapters.includes(chapter.index)) {
      link
        .setBottomLabel('New')
        .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.EMAIL));
    }
    chapters.addWidget(link);
  });

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle(manga.title))
    .addSection(
      CardService.newCardSection()
        .addWidget(CardService.newTextParagraph().setText(`Chapters: ${manga.chaptersCount}`))
        .addWidget(CardService.newTextParagraph().setText(`Read Chapters: ${readChapters.length}`))
        .addWidget(
          CardService.newTextButton()
            .setText('Mark as Read')
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName('markMangaAsRead')
                .setParameters({
                  connector,
                  manga: JSON.stringify(manga),
                }),
            ),
        ),
    )
    .addSection(chapters);

  return card.build();
}

function showChapter(event: any) {
  const { connector, manga } = getParameters(event);
  const chapterIndex = parseInt(event.parameters.chapter, 10);
  console.log('chapterIndex:', chapterIndex);

  const chapter = manga.chapters.find((chapter) => chapter.index === chapterIndex)!;
  console.log('chapter:', chapter);

  const messagesSection = CardService.newCardSection().setHeader('Chapter');
  GmailApp.setCurrentMessageAccessToken(event.messageMetadata.accessToken);
  const messages = GmailApp.search(`"${connector} ${manga.id} ${chapter.index}"`, 0, 1);
  if (messages.length > 0) {
    messages.forEach((message) => {
      const link = CardService.newDecoratedText()
        .setText(message.getFirstMessageSubject())
        .setBottomLabel(message.getLastMessageDate().toDateString())
        .setOpenLink(
          CardService.newOpenLink().setUrl(
            `https://mail.google.com/mail/u/0/#inbox/${message.getId()}`,
          ),
        )
        .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.EMAIL));
      messagesSection.addWidget(link);
    });
  } else {
    messagesSection.addWidget(
      CardService.newDecoratedText().setText('No message found for this chapter.'),
    );
  }
  messagesSection.addWidget(
    CardService.newTextButton()
      .setText('Create email for chapter.')
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName('createEmailChapter')
          .setParameters({
            connector,
            manga: JSON.stringify(manga),
            chapter: chapter.index.toString(),
          }),
      ),
  );

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle(`${manga.title} - ${chapter.index}`))
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newDecoratedText()
            .setText('Open external')
            .setOpenLink(CardService.newOpenLink().setUrl(chapter.url))
            .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.BOOKMARK)),
        )
        .addWidget(
          CardService.newTextButton()
            .setText('Mark as Read')
            .setOnClickAction(
              CardService.newAction()
                .setFunctionName('markChapterAsRead')
                .setParameters({
                  connector,
                  manga: JSON.stringify(manga),
                  chapter: chapter.index.toString(),
                }),
            ),
        ),
    )
    .addSection(messagesSection);

  return card.build();
}

function createEmailChapter(event: any) {
  const { connector, manga } = getParameters(event);
  const chapterIndex = parseInt(event.parameters.chapter, 10);
  console.log('chapterIndex:', chapterIndex);

  const chapter = manga.chapters.find((chapter) => chapter.index === chapterIndex)!;
  console.log('chapter:', chapter);

  GmailApp.setCurrentMessageAccessToken(event.messageMetadata.accessToken);
  GmailApp.sendEmail(Session.getActiveUser().getEmail(), `${manga.title} - ${chapterIndex}`, '', {
    htmlBody: `${chapter.images.map((image) => `<img src="${image}" />`).join('<br />\n')}<br /><br />\n${manga.title} - ${chapterIndex}`,
  });

  return showChapter(event);
}

function markMangaAsRead(event: any) {
  const { connector, manga } = getParameters(event);

  putUserManga({
    connector,
    manga,
    readChapters: manga.chapters.map((chapter) => chapter.index),
  });

  return showManga(event);
}
