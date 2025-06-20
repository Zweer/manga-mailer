import type { ConnectorNames } from '@zweer/manga-scraper';

import type { Manga } from '../database/manga.js';

import { connectors } from '@zweer/manga-scraper';

import { logger } from '../utils.js';

export interface MangaAutocomplete {
  connectorName: string;
  id: string;
  title: string;
  chaptersCount: number;
}

export async function searchMangas(title: string): Promise<MangaAutocomplete[]> {
  const mangasArr: MangaAutocomplete[][] = await Promise.all(
    Object.entries(connectors).map(async ([connectorName, connector]) => {
      try {
        logger.debug(`[search] Searching "${title}" with connector: ${connectorName}`);
        const newMangas = await connector.getMangas(title);

        return newMangas.map(manga => ({
          connectorName,
          id: manga.id,
          title: manga.title,
          chaptersCount: manga.chaptersCount,
        }));
      } catch (error) {
        logger.error(`[search] Error with connector ${connectorName} while searching for "${title}":`, error as Error);
        return [];
      }
    }),
  );

  const mangas = mangasArr
    .flat()
    .sort((mangaA, mangaB) => {
      if (mangaA.title.localeCompare(mangaB.title) === 0) {
        return mangaA.chaptersCount - mangaB.chaptersCount;
      }
      return mangaA.title.localeCompare(mangaB.title);
    });

  return mangas;
}

export async function retrieveManga(connectorName: string, id: string): Promise<Manga> {
  const connector = connectors[connectorName as ConnectorNames];
  // eslint-disable-next-line ts/strict-boolean-expressions
  if (!connector) {
    throw new Error('Invalid connector name');
  }

  try {
    logger.debug(`[get] Getting manga "${id}" with connector: ${connectorName}`);
    const manga = await connector.getManga(id);

    return {
      connector: connectorName,
      id,
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
  } catch (error) {
    logger.error(`[get] Error with connector ${connectorName} while getting manga "${id}":`, error as Error);
    throw error;
  }
}
