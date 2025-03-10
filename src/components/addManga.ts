import { ConnectorNames, connectors } from '../../lib/connectors';
import { putUserManga } from '../lib/db';
import { MangaAutocomplete } from '../lib/types';

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
    const connector = connectors.find((connector) => connector.name === connectorName)!;
    const needsLazyLoading = connector.needsLazyLoading;
    const manga = connector.getManga(mangaId, needsLazyLoading);

    putUserManga({
      connector: connector.name,
      needsLazyLoading,
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
