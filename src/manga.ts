import { Status } from '../lib/interfaces/manga';

import { getUserMangas } from './lib/db';

import './components/addManga';
import './components/showManga';

function mangaHomepage() {
  const mangas = getUserMangas();

  let card = CardService.newCardBuilder().setHeader(
    CardService.newCardHeader().setTitle('Manga Mailer'),
  );

  const completedMangas = mangas.filter(
    ({ manga, readChapters }) =>
      manga.status === Status.Completed && manga.chaptersCount === readChapters.length,
  );
  const ongoingMangas = mangas.filter(
    ({ manga, readChapters }) =>
      manga.status !== Status.Completed || manga.chaptersCount !== readChapters.length,
  );

  if (ongoingMangas.length !== 0) {
    const mangaListSection = CardService.newCardSection().setHeader('Your Mangas');
    ongoingMangas.forEach(({ connector, manga, readChapters }) => {
      const lastChapter = manga.chapters[manga.chapters.length - 1];
      const link = CardService.newDecoratedText()
        .setText(`${manga.title} (Chapter ${lastChapter.index})`)
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
      } else if (manga.status === Status.Hiatus) {
        link
          .setBottomLabel('Hiatus')
          .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.HOTEL));
      } else if (manga.status === Status.Completed) {
        link
          .setBottomLabel('Completed')
          .setStartIcon(CardService.newIconImage().setIcon(CardService.Icon.CLOCK));
      }

      mangaListSection.addWidget(link);
    });
    card = card.addSection(mangaListSection);
  }

  if (completedMangas.length !== 0) {
    const completedMangaListSection = CardService.newCardSection()
      .setHeader('Completed Mangas')
      .addWidget(
        CardService.newTextButton()
          .setText(`View ${completedMangas.length} mangas`)
          .setOnClickAction(CardService.newAction().setFunctionName('showCompletedMangas')),
      );
    card = card.addSection(completedMangaListSection);
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

function showCompletedMangas() {
  const mangas = getUserMangas();

  const completedMangas = mangas.filter(
    ({ manga, readChapters }) =>
      manga.status === Status.Completed && manga.chaptersCount === readChapters.length,
  );

  const card = CardService.newCardBuilder().setHeader(
    CardService.newCardHeader().setTitle('Completed Mangas'),
  );

  const completedMangaListSection = CardService.newCardSection().setHeader('Completed Mangas');
  completedMangas.forEach(({ connector, manga, readChapters }) => {
    const link = CardService.newDecoratedText()
      .setText(`${manga.title} (Chapter ${manga.chaptersCount})`)
      .setOnClickAction(
        CardService.newAction()
          .setFunctionName('showManga')
          .setParameters({
            connector,
            manga: JSON.stringify(manga),
            readChapters: JSON.stringify(readChapters),
          }),
      );

    completedMangaListSection.addWidget(link);
  });

  card.addSection(completedMangaListSection);

  return card.build();
}
