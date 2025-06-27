import type { ConnectorNames } from '@zweer/manga-scraper';

import type { ChapterInsert, MangaInsert } from '@/lib/db/model';

import { connectors } from '@zweer/manga-scraper';

import { createLogger } from '@/lib/logger';

export type MangaAutocomplete = Pick<MangaInsert, 'sourceName' | 'sourceId' | 'title' | 'chaptersCount'>;

const serviceName = 'lib:manga';

export async function searchMangas(title: string): Promise<MangaAutocomplete[]> {
  const logger = createLogger(serviceName, 'searchMangas');
  const mangasArr: MangaAutocomplete[][] = await Promise.all(
    Object.entries(connectors).map(async ([connectorName, connector]) => {
      try {
        logger.debug(`Searching "${title}" with connector: ${connectorName}`);
        const newMangas = await connector.getMangas(title);

        return newMangas.map(manga => ({
          sourceName: connectorName,
          sourceId: manga.id,
          title: manga.title,
          chaptersCount: manga.chaptersCount,
        }));
      } catch (error) {
        logger.error(`Error with connector ${connectorName} while searching for "${title}":`, error as Error);
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

export async function retrieveManga(sourceName: string, sourceId: string): Promise<MangaInsert> {
  const logger = createLogger(serviceName, 'retrieveManga');
  const connector = connectors[sourceName as ConnectorNames];
  // eslint-disable-next-line ts/strict-boolean-expressions
  if (!connector) {
    throw new Error('Invalid connector name');
  }

  try {
    logger.debug(`Retrieving manga "${sourceId}" with connector: ${sourceName}`);
    const manga = await connector.getManga(sourceId);

    return {
      sourceName,
      sourceId,
      title: manga.title,
      slug: manga.slug,
      chaptersCount: manga.chaptersCount,
    };
  } catch (error) {
    logger.error(`Error with connector ${sourceName} while retrieving manga "${sourceId}":`, error as Error);
    throw error;
  }
}

export async function retrieveChapters(sourceName: string, mangaId: string): Promise<Omit<ChapterInsert, 'mangaId'>[]> {
  const logger = createLogger(serviceName, 'retrieveChapters');
  const connector = connectors[sourceName as ConnectorNames];
  // eslint-disable-next-line ts/strict-boolean-expressions
  if (!connector) {
    throw new Error('Invalid connector name');
  }

  try {
    logger.debug(`Retrieving manga "${mangaId}" chapters with connector: ${sourceName}`);
    const chapters = await connector.getChapters(mangaId);

    return chapters.map(chapter => ({
      sourceName,
      sourceId: chapter.id,
      title: chapter.title,
      index: chapter.index,
      releasedAt: chapter.releasedAt && new Date(chapter.releasedAt),
      images: chapter.images,
    }));
  } catch (error) {
    logger.error(`Error with connector ${sourceName} while retrieving manga "${mangaId}" chapters:`, error as Error);
    throw error;
  }
}

export async function retrieveChapter(sourceName: string, mangaId: string, chapterId: string): Promise<Omit<ChapterInsert, 'mangaId'>> {
  const logger = createLogger(serviceName, 'retrieveChapter');
  const connector = connectors[sourceName as ConnectorNames];
  // eslint-disable-next-line ts/strict-boolean-expressions
  if (!connector) {
    throw new Error('Invalid connector name');
  }

  try {
    logger.debug(`Retrieving manga "${mangaId}" chapter "${chapterId}" with connector: ${sourceName}`);
    const chapter = await connector.getChapter(mangaId, chapterId);

    return {
      sourceName,
      sourceId: chapter.id,
      title: chapter.title,
      index: chapter.index,
      releasedAt: chapter.releasedAt && new Date(chapter.releasedAt),
      images: chapter.images,
    };
  } catch (error) {
    logger.error(`Error with connector ${sourceName} while retrieving manga "${mangaId}" chapter "${chapterId}":`, error as Error);
    throw error;
  }
}
