import type { ChapterInsert, Manga, MangaInsert, User } from '@/lib/db/model';

import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { chapterTable, mangaTable } from '@/lib/db/model';
import { sendEmail } from '@/lib/email';
import { createChildLogger } from '@/lib/log';
import { getChapter, getChapters, getManga } from '@/lib/manga';

const logger = createChildLogger('task:mangaUpdateChecker');

type UserToNotify = Pick<User, 'id' | 'email'>;

interface MangaUpdate extends Pick<Manga, 'sourceName' | 'id' | 'title' | 'url'> {
  chapters: ChapterInsert[];
  usersToNotify: UserToNotify[];
}

interface MangaError {
  mangaSourceName: Manga['sourceName'];
  mangaId: Manga['id'];
  mangaTitle: Manga['title'];
  message: string;
  error: Error;
}

interface MangaUpdaterResult {
  emailsSent: number;
  updatedMangas: MangaUpdate[];
  errors: MangaError[];
}

async function checkMangasForUpdates(result: MangaUpdaterResult): Promise<void> {
  logger.info('Starting manga update check...');

  const mangas = await db.query.mangaTable.findMany({
    orderBy: (mangaTable, { asc }) => asc(mangaTable.lastCheckedAt),
    limit: 10,
    with: {
      chapters: {
        limit: 1,
        orderBy: (chapterTable, { desc }) => desc(chapterTable.index),
      },
    },
  });

  logger.info(`Found ${mangas.length} mangas. Checking for updates...`);

  for (const manga of mangas) {
    logger.debug({ mangaId: manga.id, mangaTitle: manga.title }, 'Checking manga for updates.');

    const lastChapterIndex = (manga.chapters.length && manga.chapters[0].index) ?? 0;
    let freshManga: MangaInsert;

    try {
      freshManga = await getManga(manga.sourceName, manga.sourceId);
    } catch (error) {
      logger.error({ mangaId: manga.id, mangaTitle: manga.title, error }, 'Failed to fetch manga details.');

      result.errors.push({
        mangaSourceName: manga.sourceName,
        mangaId: manga.id,
        mangaTitle: manga.title,
        message: 'Manga fetch failed',
        error: error as Error,
      });

      continue;
    }

    const oldChaptersCount = manga.chaptersCount ?? 0;
    const newChaptersCount = freshManga.chaptersCount ?? 0;
    let newChapters: ChapterInsert[] = [];

    if (newChaptersCount > oldChaptersCount) {
      logger.info({
        mangaId: manga.id,
        mangaTitle: manga.title,
        oldChaptersCount,
        newChaptersCount,
      }, 'Manga has new chapters.');

      try {
        const chapters = await getChapters(manga.sourceName, manga.sourceId);
        newChapters = await Promise.all(chapters
          .filter(chapter => chapter.index! > lastChapterIndex)
          .map(
            async chapter => chapter.images && chapter.images.length > 0
              ? chapter
              : getChapter(manga.sourceName, manga.sourceId, chapter.sourceId),
          ));
      } catch (error) {
        logger.error({ mangaId: manga.id, mangaTitle: manga.title, error }, 'Failed to fetch manga chapters.');

        result.errors.push({
          mangaSourceName: manga.sourceName,
          mangaId: manga.id,
          mangaTitle: manga.title,
          message: 'Chapters fetch failed',
          error: error as Error,
        });

        continue;
      }
    } else {
      logger.debug({
        mangaId: manga.id,
        mangaTitle: manga.title,
        oldChapters: oldChaptersCount,
        newChapters: newChaptersCount,
      }, 'No new chapters found.');

      continue;
    }

    try {
      await db.update(mangaTable).set({ lastCheckedAt: new Date(), chaptersCount: newChaptersCount }).where(eq(mangaTable.id, manga.id));
    } catch (error) {
      logger.error({ mangaId: manga.id, mangaTitle: manga.title, error }, 'Failed to update manga in DB.');

      result.errors.push({
        mangaSourceName: manga.sourceName,
        mangaId: manga.id,
        mangaTitle: manga.title,
        message: 'Failed to update manga in DB',
        error: error as Error,
      });

      continue;
    }

    try {
      const chapters = await db.insert(chapterTable).values(newChapters).returning();

      result.updatedMangas.push({
        sourceName: manga.sourceName,
        id: manga.id,
        title: manga.title,
        url: manga.url,
        chapters,
        usersToNotify: [],
      });
    } catch (error) {
      logger.error({ mangaId: manga.id, mangaTitle: manga.title, error }, 'Failed to insert new chapters in DB.');

      result.errors.push({
        mangaSourceName: manga.sourceName,
        mangaId: manga.id,
        mangaTitle: manga.title,
        message: 'Failed to insert new chapters in DB',
        error: error as Error,
      });
    }
  }
}

async function retrieveUsersForUpdates(result: MangaUpdaterResult): Promise<void> {
  logger.info('Starting user retrieval...');

  const mangaIds = result.updatedMangas.map(manga => manga.id);
  const userMangas = await db.query.userMangaTable.findMany({
    where: (userMangaTable, { inArray }) => inArray(userMangaTable.mangaId, mangaIds),
    with: {
      user: true,
    },
  });

  userMangas.forEach((userManga) => {
    const manga = result.updatedMangas.find(manga => manga.id === userManga.mangaId);
    if (!manga) {
      return;
    }

    manga.usersToNotify.push({
      id: userManga.user.id,
      email: userManga.user.email,
    });
  });

  logger.info(`Found ${userMangas.length} users to be notified.`);
}

async function notifyUsersForUpdates(result: MangaUpdaterResult): Promise<void> {
  logger.info('Starting manga update notification...');

  for (const manga of result.updatedMangas) {
    if (manga.usersToNotify.length === 0) {
      continue;
    }

    for (const chapter of manga.chapters) {
      let subject = `${manga.title} - ${chapter.index}`;
      if (chapter.title != null) {
        subject += ` - ${chapter.title}`;
      }

      const imagesHtml = chapter.images!.map(image => `<img src="${image}" />`).join('<br />\n');
      const html = `${imagesHtml}<br /><br />\n${subject}`;

      for (const user of manga.usersToNotify) {
        const isEmailSent = await sendEmail({
          to: user.email,
          subject,
          html,
          text: chapter.url ?? '',
        });

        if (isEmailSent) {
          result.emailsSent++;
        } else {
          logger.error({
            mangaId: manga.id,
            mangaTitle: manga.title,
            userEmail: user.email,
          }, 'Failed to send email to user.');

          result.errors.push({
            mangaSourceName: manga.sourceName,
            mangaId: manga.id,
            mangaTitle: manga.title,
            message: 'Email send failed',
            error: new Error('Email send failed'),
          });
        }
      }
    }
  }

  logger.info(`Sent ${result.emailsSent} emails to users.`);
}

export async function mangaUpdater(): Promise<MangaUpdaterResult> {
  const result: MangaUpdaterResult = {
    emailsSent: 0,
    updatedMangas: [],
    errors: [],
  };

  await checkMangasForUpdates(result);
  await retrieveUsersForUpdates(result);
  await notifyUsersForUpdates(result);

  return result;
}
