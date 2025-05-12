import { connectors } from '@zweer/manga-scraper';

interface MangaAutocomplete {
  connectorName: string;
  id: string;
  title: string;
  chaptersCount: number;
}

export async function search(title: string): Promise<MangaAutocomplete[]> {
  console.log('[manga] search:', title);

  const mangas: MangaAutocomplete[] = [];

  await Object.entries(connectors).reduce(async (promise, [connectorName, connector]) => {
    await promise;

    console.log('[manga] connector:', connectorName);

    const newMangas = await connector.getMangas(title);

    console.log('[manga] connector:', connectorName, 'mangas:', newMangas);

    mangas.push(
      ...newMangas.map(manga => ({
        connectorName,
        id: manga.id,
        title: manga.title,
        chaptersCount: manga.chaptersCount,
      })),
    );
  }, Promise.resolve());

  mangas.sort((mangaA, mangaB) => {
    if (mangaA.title.localeCompare(mangaB.title) === 0) {
      return mangaA.chaptersCount - mangaB.chaptersCount;
    }
    return mangaA.title.localeCompare(mangaB.title);
  });

  console.log('[manga] mangas:', mangas);

  return mangas;
}