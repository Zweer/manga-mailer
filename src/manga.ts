import { connectors } from '../lib/connectors';
import { Status } from '../lib/interfaces/manga';

import {
  getUserManga,
  getUserMangas,
  MangaSaveEagerPartial,
  MangaSaveLazyComplete,
  MangaSaveLazyPartial,
} from './lib/db';
import { getParameters } from './lib/utils';

import './components/addManga';
import './components/showManga';

function mangaHomepage() {
  const mangas = getUserMangas();

  let card = CardService.newCardBuilder().setHeader(
    CardService.newCardHeader().setTitle('Manga Mailer'),
  );

  const lazyLoadMangas = mangas.filter(
    ({ needsLazyLoading }) => needsLazyLoading,
  ) as MangaSaveLazyPartial[];
  const completedMangas = mangas.filter(
    ({ manga, needsLazyLoading, readChapters }) =>
      !needsLazyLoading &&
      manga.status === Status.Completed &&
      manga.chaptersCount <= readChapters.length,
  ) as MangaSaveEagerPartial[];
  const ongoingMangas = mangas.filter(
    ({ manga, needsLazyLoading, readChapters }) =>
      !needsLazyLoading &&
      (manga.status !== Status.Completed || manga.chaptersCount > readChapters.length),
  ) as MangaSaveEagerPartial[];

  if (ongoingMangas.length !== 0) {
    const mangaListSection = CardService.newCardSection().setHeader('Your Mangas');
    ongoingMangas.forEach(({ connector, manga, lastChapter, readChapters }) => {
      const link = CardService.newDecoratedText()
        .setText(`${manga.title} (Chapter ${lastChapter.index})`)
        .setOnClickAction(
          CardService.newAction().setFunctionName('showManga').setParameters({
            connector,
            mangaId: manga.id,
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

  if (lazyLoadMangas.length !== 0) {
    const lazyLoadMangaListSection = CardService.newCardSection()
      .setHeader('Lazy Load Mangas')
      .addWidget(
        CardService.newTextButton()
          .setText(`View ${lazyLoadMangas.length} mangas`)
          .setOnClickAction(CardService.newAction().setFunctionName('showLazyLoadMangas')),
      );
    card = card.addSection(lazyLoadMangaListSection);
  }

  card = card.addSection(
    CardService.newCardSection().addWidget(
      CardService.newTextButton()
        .setText('Add Manga')
        .setOnClickAction(CardService.newAction().setFunctionName('showAddMangaForm')),
    ),
  );

  const build = card.build();

  return build;
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
  completedMangas.forEach(({ connector, manga }) => {
    const link = CardService.newDecoratedText()
      .setText(`${manga.title} (Chapter ${manga.chaptersCount})`)
      .setOnClickAction(
        CardService.newAction().setFunctionName('showManga').setParameters({
          connector,
          mangaId: manga.id,
        }),
      );

    completedMangaListSection.addWidget(link);
  });

  card
    .addSection(completedMangaListSection)
    .addSection(
      CardService.newCardSection().addWidget(
        CardService.newTextButton()
          .setText('Back to Home')
          .setOnClickAction(CardService.newAction().setFunctionName('mangaHomepage')),
      ),
    );

  return card.build();
}

function showLazyLoadMangas() {
  const mangas = getUserMangas();

  const lazyLoadMangas = mangas.filter(({ needsLazyLoading }) => needsLazyLoading);

  const card = CardService.newCardBuilder().setHeader(
    CardService.newCardHeader().setTitle('Lazy Load Mangas'),
  );

  const lazyLoadMangaListSection = CardService.newCardSection().setHeader('Lazy Load Mangas');
  lazyLoadMangas.forEach(({ connector, manga }) => {
    const link = CardService.newDecoratedText()
      .setText(`${manga.title} (${manga.chaptersCount} chapters left)`)
      .setOnClickAction(
        CardService.newAction().setFunctionName('lazyLoadManga').setParameters({
          connector,
          mangaId: manga.id,
        }),
      );

    lazyLoadMangaListSection.addWidget(link);
  });

  card.addSection(lazyLoadMangaListSection);

  return card.build();
}

function lazyLoadManga(event: any) {
  const { connector: connectorName, mangaId } = getParameters(event);
  const { manga } = getUserManga(connectorName, mangaId) as MangaSaveLazyComplete;
  const connector = connectors.find((connector) => connector.name === connectorName)!;

  const start = manga.chapters.findIndex((chapter) => chapter.images.length === 0);
  connector.lazyLoadManga(manga, start);

  const nav = CardService.newNavigation().popToRoot().updateCard(showLazyLoadMangas());

  return CardService.newActionResponseBuilder().setNavigation(nav).build();
}
