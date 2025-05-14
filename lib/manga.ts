import type { ConnectorNames } from '@zweer/manga-scraper';

import type { MangaInsert } from '@/lib/db/model/manga';

import { connectors } from '@zweer/manga-scraper';

interface MangaAutocomplete {
  connectorName: string;
  id: string;
  title: string;
  chaptersCount: number;
}

export async function searchMangas(title: string): Promise<MangaAutocomplete[]> {
  console.log('[manga] search:', title);

  const mangas: MangaAutocomplete[] = [];

  await Object.entries(connectors).reduce(async (promise, [connectorName, connector]) => {
    await promise;

    const newMangas = await connector.getMangas(title);

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

  console.log('[manga] mangas found:', mangas.length);

  return mangas;
}

export async function getManga(connectorName: string, id: string): Promise<MangaInsert> {
  const connector = connectors[connectorName as ConnectorNames];
  // eslint-disable-next-line ts/strict-boolean-expressions
  if (!connector) {
    throw new Error('Invalid connector name');
  }

  const manga = await connector.getManga(id);

  return {
    sourceName: connectorName,
    sourceId: id,
    slug: manga.slug,
    title: manga.title,
    author: manga.author,
    artist: manga.artist,
    excerpt: manga.excerpt,
    image: manga.image,
    url: manga.url,
    releasedAt: manga.releasedAt,
    status: manga.status,
    genres: manga.genres,
    score: manga.score,
    chaptersCount: manga.chaptersCount,
  };
}
