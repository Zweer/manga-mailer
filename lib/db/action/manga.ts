import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { findUserByTelegramId } from '@/lib/db/action/user';
import { mangaTable, userMangaTable } from '@/lib/db/model';

type TrackMangaOutput = {
  success: true;
} | {
  success: false;
  invalidUser: boolean;
  alreadyTracked: boolean;
  databaseError?: string;
};

export async function trackManga(manga: typeof mangaTable.$inferInsert, telegramId: number): Promise<TrackMangaOutput> {
  try {
    const user = await findUserByTelegramId(telegramId);
    if (!user) {
      return {
        success: false,
        invalidUser: true,
        alreadyTracked: false,
      };
    }

    let existingManga = await db.query.mangaTable.findFirst({
      where: and(
        eq(mangaTable.sourceName, manga.sourceName),
        eq(mangaTable.sourceId, manga.sourceId),
      ),
    });

    if (!existingManga) {
      [existingManga] = await db.insert(mangaTable).values(manga).returning();
    }

    const existingTracker = await db.query.userMangaTable.findFirst({
      where: and(
        eq(userMangaTable.userId, user.id),
        eq(userMangaTable.mangaId, existingManga.id),
      ),
    });

    if (existingTracker) {
      return {
        success: false,
        invalidUser: false,
        alreadyTracked: true,
      };
    }

    await db.insert(userMangaTable).values({
      userId: user.id,
      mangaId: existingManga.id,
    });

    return { success: true };
  } catch (error) {
    console.error('[action:manga:trackManga] Database error:', error);

    return {
      success: false,
      invalidUser: false,
      alreadyTracked: false,
      databaseError: (error as Error).message,
    };
  }
}

export async function listTrackedMangas(userId: string): Promise<(typeof mangaTable.$inferSelect)[]> {
  // const userMangas = await db.query.userMangaTable.findMany({
  //   where: eq(userMangaTable.userId, userId),
  //   with: {
  //     manga: true,
  //   },
  // });

  const mangas = await db.query.mangaTable.findMany({
    where: eq(userMangaTable.userId, userId),
    with: {
      userManga: true,
    },
    orderBy: (manga, { asc }) => asc(manga.title),
  });

  return mangas;
}
