import { ConnectorNames, connectors } from '../lib/connectors';

interface MangaAutocomplete {
  connector: ConnectorNames;
  id: string;
  title: string;
  chaptersCount: number;
}

export function mangaHomepage() {
  const userProperties = PropertiesService.getUserProperties();
  const userPropertiesMangas = userProperties.getProperty('mangas');
  const userMangas = userPropertiesMangas ? JSON.parse(userPropertiesMangas) : [];
  console.log('userMangas:', userMangas);

  // const mangaListSection = CardService.newCardSection().setHeader('Your Mangas');
  // userMangas.forEach((mangaId: string) => {
  //   const manga = mangas.find((manga) => manga.id === mangaId);
  //   if (manga) {
  //     mangaListSection.addWidget(CardService.newTextParagraph().setText(manga.title));
  //   }
  // });
  // console.log('mangaListSection:', mangaListSection);

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Manga @ Mail'))
    // .addSection(mangaListSection)
    .addSection(
      CardService.newCardSection().addWidget(
        CardService.newTextButton()
          .setText('Add Manga')
          .setOnClickAction(CardService.newAction().setFunctionName('showAddMangaForm')),
      ),
    )
    .build();

  return card;
}

export function showAddMangaForm() {
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

export function searchManga(event: { formInput: { mangaName: string } }) {
  console.log('event:', event);

  const mangaName = event.formInput.mangaName.toLowerCase()!;
  const matchingMangas = Object.entries(connectors)
    .reduce((mangas, [connectorName, connector]) => {
      const newMangas = connector.getMangas(mangaName);

      mangas.push(
        ...newMangas.map((manga) => ({
          connector: connectorName as ConnectorNames,
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
    selectionInput.addItem(manga.title, manga.id, false);
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

export function selectManga(event: any) {
  console.log(event);
  const mangaId = event.formInput.mangaDropdown;
  if (mangaId) {
    const userProperties = PropertiesService.getUserProperties();
    const userPropertiesMangas = userProperties.getProperty('mangas');
    const userMangas = userPropertiesMangas ? JSON.parse(userPropertiesMangas) : [];
    userMangas.push(mangaId);
    userProperties.setProperty('mangas', JSON.stringify(userMangas));
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
