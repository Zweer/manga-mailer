import type { Manga, MangaInsert } from '@/lib/db/model';

import { and, eq, inArray } from 'drizzle-orm';

import { db } from '@/lib/db';
import { mangaTable, userMangaTable } from '@/lib/db/model';
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('db:action:manga');

export type TrackMangaOutput = {
  success: true;
} | {
  success: false;
  alreadyTracked: boolean;
  databaseError?: string;
};

export async function trackManga(
  manga: MangaInsert,
  userId: string,
  lastReadChapter: number,
): Promise<TrackMangaOutput> {
  logger.debug('[trackManga] Attempting to remove manga tracking.', { manga, userId, lastReadChapter });

  try {
    let existingManga = await db.query.mangaTable.findFirst({
      where: and(
        eq(mangaTable.sourceName, manga.sourceName),
        eq(mangaTable.sourceId, manga.sourceId),
      ),
    });

    if (!existingManga) {
      logger.debug('[trackManga] Manga does not exist, inserting.', { manga, userId, lastReadChapter });
      [existingManga] = await db.insert(mangaTable).values(manga).returning();
    }

    const existingTracker = await db.query.userMangaTable.findFirst({
      where: and(
        eq(userMangaTable.userId, userId),
        eq(userMangaTable.mangaId, existingManga.id),
      ),
    });

    if (existingTracker) {
      return {
        success: false,
        alreadyTracked: true,
      };
    }

    await db.insert(userMangaTable).values({
      userId,
      mangaId: existingManga.id,
      lastReadChapter,
    });

    return { success: true };
  } catch (error) {
    logger.error('[trackManga] Database error:', error, { manga, userId, lastReadChapter });

    return {
      success: false,
      alreadyTracked: false,
      databaseError: (error as Error).message,
    };
  }
}

export type RemoveTrackedMangaOutput = {
  success: true;
} | {
  success: false;
  notFound: boolean;
  databaseError?: string;
};

export async function removeTrackedManga(userId: string, mangaId: string): Promise<RemoveTrackedMangaOutput> {
  logger.debug('[removeTrackedManga] Attempting to remove manga tracking.', { userId, mangaId });
  try {
    const existingTracker = await db.query.userMangaTable.findFirst({
      where: and(
        eq(userMangaTable.userId, userId),
        eq(userMangaTable.mangaId, mangaId),
      ),
    });

    if (!existingTracker) {
      logger.warn('[removeTrackedManga] Tracker not found. No action taken.', { userId, mangaId });
      return { success: false, notFound: true };
    }

    await db.delete(userMangaTable).where(
      and(
        eq(userMangaTable.userId, userId),
        eq(userMangaTable.mangaId, mangaId),
      ),
    );
    logger.info('[removeTrackedManga] Manga tracking removed successfully.', { userId, mangaId });
    return { success: true };
  } catch (error) {
    logger.error('[removeTrackedManga] Database error while removing manga tracking.', { error, userId, mangaId });
    return {
      success: false,
      notFound: false,
      databaseError: (error as Error).message,
    };
  }
}

export async function listTrackedMangas(userId: string): Promise<Manga[]> {
  const userMangas = await db.query.userMangaTable.findMany({
    where: eq(userMangaTable.userId, userId),
  });

  const mangas = await db.query.mangaTable.findMany({
    where: inArray(mangaTable.id, userMangas.map(userManga => userManga.mangaId)),
    orderBy: (manga, { asc }) => asc(manga.title),
  });

  return mangas;
}
