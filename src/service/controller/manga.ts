import type { Manga } from '../database/manga.js';

import { buildMangaId, getManga, upsertManga } from '../database/manga.js';
import { getTracker, upsertTracker } from '../database/tracker.js';
import { logger } from '../utils.js';

type TrackMangaOutput = {
  success: true;
} | {
  success: false;
  alreadyTracked?: boolean;
  validationErrors?: { field: string; error: string }[];
  databaseError?: string;
};

export async function trackManga(
  manga: Manga,
  userId: number,
  lastReadChapter: number,
): Promise<TrackMangaOutput> {
  logger.debug('[trackManga] Attempting to track a manga.', { manga, userId, lastReadChapter });

  const existingManga = await getManga(manga.connector, manga.id);
  if (!existingManga) {
    const result = await upsertManga(manga);

    if (!result.success) {
      return result;
    }
  }

  const mangaId = buildMangaId(manga.connector, manga.id);
  const existingTraker = await getTracker(userId, mangaId);
  if (existingTraker) {
    return { success: false, alreadyTracked: true };
  }

  const result = upsertTracker({
    userId,
    mangaId,
    lastReadChapter,
  });

  return result;
}
