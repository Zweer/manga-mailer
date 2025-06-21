import type { ConnectorNames } from '@zweer/manga-scraper';

import type { Chapter } from '../database/chapter.js';

import { connectors } from '@zweer/manga-scraper';

import { logger } from '../utils.js';

export async function retrieveChapters(connectorName: string, mangaId: string): Promise<Chapter[]> {
  const connector = connectors[connectorName as ConnectorNames];
  // eslint-disable-next-line ts/strict-boolean-expressions
  if (!connector) {
    throw new Error('Invalid connector name');
  }

  try {
    logger.debug(`[getChapters] Getting manga "${mangaId}" chapters with connector: ${connectorName}`);
    const chapters = await connector.getChapters(mangaId);

    return chapters.map(chapter => ({
      mangaId: `${connectorName}:${mangaId}`,
      id: chapter.id,
      title: chapter.title,
      index: chapter.index,
      url: chapter.url,
      releasedAt: chapter.releasedAt && new Date(chapter.releasedAt),
      images: chapter.images,
    }));
  } catch (error) {
    logger.error(`[getChapters] Error with connector ${connectorName} while getting manga "${mangaId}" chapters:`, error as Error);
    throw error;
  }
}

export async function getChapter(connectorName: string, mangaId: string, chapterId: string): Promise<Chapter> {
  const connector = connectors[connectorName as ConnectorNames];
  // eslint-disable-next-line ts/strict-boolean-expressions
  if (!connector) {
    throw new Error('Invalid connector name');
  }

  try {
    logger.debug(`[getChapter] Getting manga "${mangaId}" chapter "${chapterId}" with connector: ${connectorName}`);
    const chapter = await connector.getChapter(mangaId, chapterId);

    return {
      mangaId: `${connectorName}:${mangaId}`,
      id: chapter.id,
      title: chapter.title,
      index: chapter.index,
      url: chapter.url,
      releasedAt: chapter.releasedAt && new Date(chapter.releasedAt),
      images: chapter.images,
    };
  } catch (error) {
    logger.error(`[getChapter] Error with connector ${connectorName} while getting manga "${mangaId}" chapter "${chapterId}":`, error as Error);
    throw error;
  }
}
