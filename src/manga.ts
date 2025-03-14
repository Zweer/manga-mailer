import { connectors } from '../lib/connectors';
import { Status } from '../lib/interfaces/manga';

import {
  deleteUserManga,
  getUserManga,
  getUserMangas,
  MangaSave,
  migrate,
  putUserManga,
} from './lib/db';
import { calculateLazyChaptersRemainingStart, getParameters } from './lib/utils';

import './components/addManga';
import './components/showManga';

function mangaHomepage() {
  migrate();

  const mangas = getUserMangas();

  let card = CardService.newCardBuilder().setHeader(
    CardService.newCardHeader().setTitle('Manga Mailer'),
  );

  const lazyLoadMangas = mangas.filter(({ needsLazyLoading }) => needsLazyLoading) as MangaSave[];
  console.log('lazyLoadMangas:', lazyLoadMangas.length);

  const completedMangas = mangas.filter(
    ({ manga, needsLazyLoading, unreadChapters }) =>
      !needsLazyLoading && manga.status === Status.Completed && unreadChapters === 0,
  ) as MangaSave[];
  console.log('completedMangas:', completedMangas.length);

  const ongoingMangas = mangas.filter(
    ({ manga, needsLazyLoading, unreadChapters }) =>
      !needsLazyLoading && (manga.status !== Status.Completed || unreadChapters > 0),
  ) as MangaSave[];
  console.log('ongoingMangas:', ongoingMangas.length);

  if (ongoingMangas.length !== 0) {
    const mangaListSection = CardService.newCardSection().setHeader('Your Mangas');
    ongoingMangas.forEach(({ connector, manga, lastChapter, unreadChapters }) => {
      const link = CardService.newDecoratedText()
        .setText(`${manga.title} (Chapter ${lastChapter.index})`)
        .setOnClickAction(
          CardService.newAction().setFunctionName('showManga').setParameters({
            connector,
            mangaId: manga.id,
          }),
        );

      if (unreadChapters) {
        link
          .setBottomLabel(`New chapters: ${unreadChapters}`)
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
    ({ manga, unreadChapters }) => manga.status === Status.Completed && unreadChapters === 0,
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
  lazyLoadMangas.forEach(({ connector, manga, lazyChaptersRemaining }) => {
    const link = CardService.newDecoratedText()
      .setText(manga.title)
      .setBottomLabel(`${lazyChaptersRemaining ?? manga.chaptersCount} chapters left`)
      .setOnClickAction(
        CardService.newAction().setFunctionName('lazyLoadManga').setParameters({
          connector,
          mangaId: manga.id,
        }),
      );

    lazyLoadMangaListSection.addWidget(link);
  });

  card
    .addSection(lazyLoadMangaListSection)
    .addSection(
      CardService.newCardSection().addWidget(
        CardService.newTextButton()
          .setText('Back to Home')
          .setOnClickAction(CardService.newAction().setFunctionName('mangaHomepage')),
      ),
    );

  return card.build();
}

function lazyLoadManga(event: any) {
  const { connector: connectorName, mangaId } = getParameters(event);
  const { manga, readChapters } = getUserManga(connectorName, mangaId);
  const connector = connectors.find((connector) => connector.name === connectorName)!;

  const start = calculateLazyChaptersRemainingStart(manga.chapters);
  console.log(manga.title, start, manga.chapters.length);

  connector.lazyLoadManga(manga, start);

  putUserManga({
    connector: connectorName,
    manga,
    readChapters,
    needsLazyLoading: calculateLazyChaptersRemainingStart(manga.chapters) !== -1,
  });

  return showLazyLoadMangas();
}

function deleteManga(event: any) {
  const { connector, mangaId } = getParameters(event);

  deleteUserManga(connector, mangaId);

  return CardService.newNavigation().updateCard(mangaHomepage());
}
