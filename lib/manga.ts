import type { ConnectorNames } from '@zweer/manga-scraper';

import type { ChapterInsert, MangaInsert } from '@/lib/db/model/manga';

import { connectors } from '@zweer/manga-scraper';

import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('lib:manga');

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
        logger.error(`[search] Error with connector ${connectorName} while searching for "${title}":`, error);
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

export async function getManga(connectorName: string, id: string): Promise<MangaInsert> {
  const connector = connectors[connectorName as ConnectorNames];
  // eslint-disable-next-line ts/strict-boolean-expressions
  if (!connector) {
    throw new Error('Invalid connector name');
  }

  try {
    logger.debug(`[get] Getting manga "${id}" with connector: ${connectorName}`);
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
  } catch (error) {
    logger.error(`[get] Error with connector ${connectorName} while getting manga "${id}":`, error);
    throw error;
  }
}

export async function getChapters(connectorName: string, mangaId: string): Promise<ChapterInsert[]> {
  const connector = connectors[connectorName as ConnectorNames];
  // eslint-disable-next-line ts/strict-boolean-expressions
  if (!connector) {
    throw new Error('Invalid connector name');
  }

  try {
    logger.debug(`[getChapters] Getting manga "${mangaId}" chapters with connector: ${connectorName}`);
    const chapters = await connector.getChapters(mangaId);

    return chapters.map(chapter => ({
      mangaId,
      sourceName: connectorName,
      sourceId: chapter.id,
      title: chapter.title,
      index: chapter.index,
      url: chapter.url,
      releasedAt: chapter.releasedAt && new Date(chapter.releasedAt),
      images: chapter.images,
    }));
  } catch (error) {
    logger.error(`[getChapters] Error with connector ${connectorName} while getting manga "${mangaId}" chapters:`, error);
    throw error;
  }
}

export async function getChapter(connectorName: string, mangaId: string, chapterId: string): Promise<ChapterInsert> {
  const connector = connectors[connectorName as ConnectorNames];
  // eslint-disable-next-line ts/strict-boolean-expressions
  if (!connector) {
    throw new Error('Invalid connector name');
  }

  try {
    logger.debug(`[getChapter] Getting manga "${mangaId}" chapter "${chapterId}" with connector: ${connectorName}`);
    const chapter = await connector.getChapter(mangaId, chapterId);

    return {
      mangaId,
      sourceName: connectorName,
      sourceId: chapter.id,
      title: chapter.title,
      index: chapter.index,
      url: chapter.url,
      releasedAt: chapter.releasedAt && new Date(chapter.releasedAt),
      images: chapter.images,
    };
  } catch (error) {
    logger.error(`[getChapter] Error with connector ${connectorName} while getting manga "${mangaId}" chapter "${chapterId}":`, error);
    throw error;
  }
}
