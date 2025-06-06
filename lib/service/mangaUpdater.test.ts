import type { MockInstance } from 'vitest';

import type { Chapter, Manga, User } from '@/lib/db/model';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';
import { chapterTable, mangaTable, userMangaTable, userTable } from '@/lib/db/model';
import { mangaUpdater } from '@/lib/service/mangaUpdater';
import { loggerWriteSpy } from '@/test/log';
import { defaultUser } from '@/test/mocks/db/user';
import { mockedSendEmail, mockSendEmailError, mockSendEmailSuccess } from '@/test/mocks/email';
import {
  defaultChapter,
  defaultManga,
  mockedGetChapters,
  mockedGetManga,
  mockGetChaptersError,
  mockGetChaptersSuccess,
  mockGetMangaConnectorError,
  mockGetMangaSuccess,
} from '@/test/mocks/manga';

vi.mock('@/lib/manga', () => ({
  getManga: vi.fn(),
  searchMangas: vi.fn(),
  getChapters: vi.fn(),
  getChapter: vi.fn(),
}));
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(),
}));

const manga1: Manga = {
  ...defaultManga,
  id: 'manga-id-1',
  sourceName: 'TestConnectorA',
  sourceId: 'manga-source-id-1',
  title: 'Epic Adventure Manga 1',
  chaptersCount: 11,
};
const manga1Chapters: Chapter[] = Array.from({ length: manga1.chaptersCount! }, (_, index) => ({
  ...defaultChapter,
  id: `chapter-id-a-${index}`,
  mangaId: manga1.id,
  sourceId: `chapter-source-id-a-${index}`,
  title: `${defaultChapter.title} ${index}`,
  index,
}));
const manga2: Manga = {
  ...defaultManga,
  id: 'manga-id-2',
  sourceName: 'TestConnectorA',
  sourceId: 'manga-source-id-2',
  title: 'Epic Adventure Manga 2',
  chaptersCount: 12,
};
const manga2Chapters: Chapter[] = Array.from({ length: manga2.chaptersCount! }, (_, index) => ({
  ...defaultChapter,
  id: `chapter-id-b-${index}`,
  mangaId: manga2.id,
  sourceId: `chapter-source-id-b-${index}`,
  title: `${defaultChapter.title} ${index}`,
  index,
}));

const user1: User = {
  ...defaultUser,
  id: 'test-user-id-1',
  name: 'Test User 1',
  email: 'test1@example.com',
  telegramId: 1,
};

describe('task: checkForMangaUpdates', () => {
  let insertSpy: MockInstance<typeof db.insert>;
  let updateSpy: MockInstance<typeof db.update>;

  beforeEach(async () => {
    insertSpy = vi.spyOn(db, 'insert');
    updateSpy = vi.spyOn(db, 'update');

    await db.insert(userTable).values([user1]);
    await db.insert(mangaTable).values([manga1, manga2]);
    await db.insert(chapterTable).values([...manga1Chapters, ...manga2Chapters]);
  });

  it('should check a manga even if none is tracking, find no update, and not update DB or list users', async () => {
    mockGetMangaSuccess(manga1);
    mockGetMangaSuccess(manga2);

    const result = await mangaUpdater();

    expect(mockedGetManga).toHaveBeenCalledTimes(2);
    expect(mockedGetChapters).toHaveBeenCalledTimes(0);
    expect(mockedSendEmail).toHaveBeenCalledTimes(0);

    expect(result).toEqual({
      emailsSent: 0,
      updatedMangas: [],
      errors: [],
    });

    expect(updateSpy).not.toHaveBeenCalled();

    expect(loggerWriteSpy).toHaveBeenCalledTimes(10);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      msg: 'Starting manga update check...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'info',
      msg: 'Found 2 mangas. Checking for updates...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
      level: 'debug',
      mangaId: 'manga-id-1',
      mangaTitle: 'Epic Adventure Manga 1',
      msg: 'Checking manga for updates.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
      level: 'debug',
      mangaId: 'manga-id-1',
      mangaTitle: 'Epic Adventure Manga 1',
      oldChapters: 11,
      newChapters: 11,
      msg: 'No new chapters found.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
      level: 'debug',
      mangaId: 'manga-id-2',
      mangaTitle: 'Epic Adventure Manga 2',
      msg: 'Checking manga for updates.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
      level: 'debug',
      mangaId: 'manga-id-2',
      mangaTitle: 'Epic Adventure Manga 2',
      oldChapters: 12,
      newChapters: 12,
      msg: 'No new chapters found.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
      level: 'info',
      msg: 'Starting user retrieval...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
      level: 'info',
      msg: 'Found 0 users to be notified.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
      level: 'info',
      msg: 'Starting manga update notification...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
      level: 'info',
      msg: 'Sent 0 emails to users.',
      serviceName: 'task:mangaUpdateChecker',
    });
  });

  it('should find an update, update DB, and identify users to notify', async () => {
    const freshChaptersCount = 12;
    mockGetMangaSuccess({
      ...manga1,
      chaptersCount: freshChaptersCount,
    });
    mockGetChaptersSuccess([
      ...manga1Chapters,
      {
        ...defaultChapter,
        id: 'chapter-id-a-11',
        mangaId: manga1.id,
        sourceId: 'chapter-source-id-a-11',
        title: `${defaultChapter.title} 11`,
        index: 11,
      },
    ]);
    mockGetMangaSuccess(manga2);

    const result = await mangaUpdater();

    expect(mockedGetManga).toHaveBeenCalledTimes(2);
    expect(mockedGetChapters).toHaveBeenCalledTimes(1);
    expect(mockedSendEmail).toHaveBeenCalledTimes(0);

    expect(result).toEqual({
      emailsSent: 0,
      updatedMangas: [{
        id: manga1.id,
        sourceName: manga1.sourceName,
        title: manga1.title,
        url: manga1.url,
        chapters: [expect.objectContaining({ index: 11 })],
        usersToNotify: [],
      }],
      errors: [],
    });

    expect(updateSpy).toHaveBeenCalledWith(mangaTable);
    const newManga1 = await db.query.mangaTable.findFirst({
      where: (manga, { eq }) => eq(manga.id, manga1.id),
    });

    expect(newManga1).toHaveProperty('chaptersCount', freshChaptersCount);

    expect(loggerWriteSpy).toHaveBeenCalledTimes(10);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      msg: 'Starting manga update check...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'info',
      msg: 'Found 2 mangas. Checking for updates...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
      level: 'debug',
      mangaId: 'manga-id-1',
      mangaTitle: 'Epic Adventure Manga 1',
      msg: 'Checking manga for updates.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
      level: 'info',
      mangaId: 'manga-id-1',
      mangaTitle: 'Epic Adventure Manga 1',
      oldChaptersCount: 11,
      newChaptersCount: 12,
      msg: 'Manga has new chapters.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
      level: 'debug',
      mangaId: 'manga-id-2',
      mangaTitle: 'Epic Adventure Manga 2',
      msg: 'Checking manga for updates.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
      level: 'debug',
      mangaId: 'manga-id-2',
      mangaTitle: 'Epic Adventure Manga 2',
      oldChapters: 12,
      newChapters: 12,
      msg: 'No new chapters found.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
      level: 'info',
      msg: 'Starting user retrieval...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
      level: 'info',
      msg: 'Found 0 users to be notified.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
      level: 'info',
      msg: 'Starting manga update notification...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
      level: 'info',
      msg: 'Sent 0 emails to users.',
      serviceName: 'task:mangaUpdateChecker',
    });
  });

  describe('some manga should be tracked', () => {
    const lastReadChapter = 8;

    beforeEach(async () => {
      await db.insert(userMangaTable).values([{
        mangaId: manga1.id,
        userId: user1.id,
        lastReadChapter,
      }]);
    });

    it('should check a manga, find no update, and not update DB or list users', async () => {
      mockGetMangaSuccess(manga1);
      mockGetMangaSuccess(manga2);

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(0);
      expect(mockedSendEmail).toHaveBeenCalledTimes(0);

      expect(result).toEqual({
        emailsSent: 0,
        updatedMangas: [],
        errors: [],
      });

      expect(updateSpy).not.toHaveBeenCalled();

      expect(loggerWriteSpy).toHaveBeenCalledTimes(10);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChapters: 11,
        newChapters: 11,
        msg: 'No new chapters found.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        oldChapters: 12,
        newChapters: 12,
        msg: 'No new chapters found.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Found 0 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'info',
        msg: 'Sent 0 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });

    it('should find an update, update DB, and identify users to notify', async () => {
      const freshChaptersCount = 12;
      mockGetMangaSuccess({
        ...manga1,
        chaptersCount: freshChaptersCount,
      });
      mockGetChaptersSuccess([
        ...manga1Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        },
      ]);
      mockGetMangaSuccess(manga2);
      mockSendEmailSuccess();

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith({
        to: user1.email,
        subject: 'Epic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        html: '<img src=\"image-1\" /><br />\n<img src=\"image-2\" /><br /><br />\nEpic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        text: defaultChapter.url,
      });

      expect(result).toEqual({
        emailsSent: 1,
        updatedMangas: [{
          id: manga1.id,
          sourceName: manga1.sourceName,
          title: manga1.title,
          url: manga1.url,
          chapters: [expect.objectContaining({ index: 11 })],
          usersToNotify: [{
            id: user1.id,
            email: user1.email,
          }],
        }],
        errors: [],
      });

      expect(updateSpy).toHaveBeenCalledWith(mangaTable);
      const newManga1 = await db.query.mangaTable.findFirst({
        where: (manga, { eq }) => eq(manga.id, manga1.id),
      });

      expect(newManga1).toHaveProperty('chaptersCount', freshChaptersCount);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(10);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'info',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChaptersCount: 11,
        newChaptersCount: 12,
        msg: 'Manga has new chapters.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        oldChapters: 12,
        newChapters: 12,
        msg: 'No new chapters found.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Found 1 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'info',
        msg: 'Sent 1 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });

    it('should find an update, update DB, and identify users to notify, but fails sending the email', async () => {
      const freshChaptersCount = 12;
      mockGetMangaSuccess({
        ...manga1,
        chaptersCount: freshChaptersCount,
      });
      mockGetChaptersSuccess([
        ...manga1Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        },
      ]);
      mockGetMangaSuccess(manga2);
      mockSendEmailError();

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith({
        to: user1.email,
        subject: 'Epic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        html: '<img src=\"image-1\" /><br />\n<img src=\"image-2\" /><br /><br />\nEpic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        text: defaultChapter.url,
      });

      expect(result).toEqual({
        emailsSent: 0,
        updatedMangas: [{
          id: manga1.id,
          sourceName: manga1.sourceName,
          title: manga1.title,
          url: manga1.url,
          chapters: [expect.objectContaining({ index: 11 })],
          usersToNotify: [{
            id: user1.id,
            email: user1.email,
          }],
        }],
        errors: [{
          mangaId: 'manga-id-1',
          mangaSourceName: 'TestConnectorA',
          mangaTitle: 'Epic Adventure Manga 1',
          message: 'Email send failed',
          error: expect.any(Object),
        }],
      });

      expect(updateSpy).toHaveBeenCalledWith(mangaTable);
      const newManga1 = await db.query.mangaTable.findFirst({
        where: (manga, { eq }) => eq(manga.id, manga1.id),
      });

      expect(newManga1).toHaveProperty('chaptersCount', freshChaptersCount);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(11);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'info',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChaptersCount: 11,
        newChaptersCount: 12,
        msg: 'Manga has new chapters.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        oldChapters: 12,
        newChapters: 12,
        msg: 'No new chapters found.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Found 1 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'error',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Failed to send email to user.',
        userEmail: 'test1@example.com',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(11, {
        level: 'info',
        msg: 'Sent 0 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });

    it('should handle manga scraper error for one manga and continue with others', async () => {
      const freshChaptersCount = 12;
      mockGetMangaSuccess({
        ...manga1,
        chaptersCount: freshChaptersCount,
      });
      mockGetChaptersSuccess([
        ...manga1Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        },
      ]);
      mockGetMangaConnectorError();
      mockSendEmailSuccess();

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith({
        to: user1.email,
        subject: 'Epic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        html: '<img src=\"image-1\" /><br />\n<img src=\"image-2\" /><br /><br />\nEpic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        text: defaultChapter.url,
      });

      expect(result).toEqual({
        emailsSent: 1,
        updatedMangas: [{
          id: manga1.id,
          sourceName: manga1.sourceName,
          title: manga1.title,
          url: manga1.url,
          chapters: [expect.objectContaining({ index: 11 })],
          usersToNotify: [{
            id: user1.id,
            email: user1.email,
          }],
        }],
        errors: [{
          mangaId: 'manga-id-2',
          mangaSourceName: 'TestConnectorA',
          mangaTitle: 'Epic Adventure Manga 2',
          message: 'Manga fetch failed',
          error: expect.any(Object),
        }],
      });

      expect(updateSpy).toHaveBeenCalledWith(mangaTable);
      const newManga1 = await db.query.mangaTable.findFirst({
        where: (manga, { eq }) => eq(manga.id, manga1.id),
      });

      expect(newManga1).toHaveProperty('chaptersCount', freshChaptersCount);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(10);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'info',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChaptersCount: 11,
        newChaptersCount: 12,
        msg: 'Manga has new chapters.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'error',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Failed to fetch manga details.',
        error: expect.any(Object),
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Found 1 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'info',
        msg: 'Sent 1 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });

    it('should handle chapters scraper error for one manga and continue with others', async () => {
      const freshChaptersACount = 12;
      const freshChaptersBCount = 13;
      mockGetMangaSuccess({
        ...manga1,
        chaptersCount: freshChaptersACount,
      });
      mockGetChaptersSuccess([
        ...manga1Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        },
      ]);
      mockGetMangaSuccess({
        ...manga2,
        chaptersCount: freshChaptersBCount,
      });
      mockGetChaptersError();
      mockSendEmailSuccess();

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(2);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith({
        to: user1.email,
        subject: 'Epic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        html: '<img src=\"image-1\" /><br />\n<img src=\"image-2\" /><br /><br />\nEpic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        text: defaultChapter.url,
      });

      expect(result).toEqual({
        emailsSent: 1,
        updatedMangas: [{
          id: manga1.id,
          sourceName: manga1.sourceName,
          title: manga1.title,
          url: manga1.url,
          chapters: [expect.objectContaining({ index: 11 })],
          usersToNotify: [{
            id: user1.id,
            email: user1.email,
          }],
        }],
        errors: [{
          mangaId: 'manga-id-2',
          mangaSourceName: 'TestConnectorA',
          mangaTitle: 'Epic Adventure Manga 2',
          message: 'Chapters fetch failed',
          error: expect.any(Object),
        }],
      });

      expect(updateSpy).toHaveBeenCalledWith(mangaTable);
      const newManga1 = await db.query.mangaTable.findFirst({
        where: (manga, { eq }) => eq(manga.id, manga1.id),
      });

      expect(newManga1).toHaveProperty('chaptersCount', freshChaptersACount);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(11);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'info',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChaptersCount: 11,
        newChaptersCount: 12,
        msg: 'Manga has new chapters.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'info',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Manga has new chapters.',
        newChaptersCount: 13,
        oldChaptersCount: 12,
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'error',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Failed to fetch manga chapters.',
        error: expect.any(Object),
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Found 1 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(11, {
        level: 'info',
        msg: 'Sent 1 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });

    it('should handle db error for one manga and continue with others', async () => {
      const freshChaptersACount = 12;
      const freshChaptersBCount = 13;
      mockGetMangaSuccess({
        ...manga1,
        chaptersCount: freshChaptersACount,
      });
      mockGetChaptersSuccess([
        ...manga1Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        },
      ]);
      mockGetMangaSuccess({
        ...manga2,
        chaptersCount: freshChaptersBCount,
      });
      mockGetChaptersSuccess([
        ...manga2Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-b-12',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-b-12',
          title: `${defaultChapter.title} 12`,
          index: 12,
        },
      ]);
      mockSendEmailSuccess();

      const simulatedError = 'Simulated error';
      updateSpy.mockImplementationOnce(() => ({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValueOnce({}),
      }) as any);
      updateSpy.mockImplementationOnce(() => ({
        set: vi.fn().mockReturnThis(),
        where: vi.fn()
          .mockRejectedValueOnce(new Error(simulatedError)),
      }) as any);

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(2);

      expect(updateSpy).toHaveBeenCalledWith(mangaTable);
      expect(updateSpy).toHaveBeenCalledTimes(2);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith({
        to: user1.email,
        subject: 'Epic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        html: '<img src=\"image-1\" /><br />\n<img src=\"image-2\" /><br /><br />\nEpic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        text: defaultChapter.url,
      });

      expect(result).toEqual({
        emailsSent: 1,
        updatedMangas: [{
          id: manga1.id,
          sourceName: manga1.sourceName,
          title: manga1.title,
          url: manga1.url,
          chapters: [expect.objectContaining({ index: 11 })],
          usersToNotify: [{
            id: user1.id,
            email: user1.email,
          }],
        }],
        errors: [{
          mangaId: manga2.id,
          mangaSourceName: manga2.sourceName,
          mangaTitle: manga2.title,
          message: 'Failed to update manga in DB',
          error: expect.any(Object),
        }],
      });

      expect(loggerWriteSpy).toHaveBeenCalledTimes(11);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'info',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChaptersCount: 11,
        newChaptersCount: 12,
        msg: 'Manga has new chapters.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'info',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Manga has new chapters.',
        newChaptersCount: 13,
        oldChaptersCount: 12,
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'error',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Failed to update manga in DB.',
        error: expect.any(Object),
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Found 1 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(11, {
        level: 'info',
        msg: 'Sent 1 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });

    it('should handle db error for one manga chapters and continue with others', async () => {
      const freshChaptersACount = 12;
      const freshChaptersBCount = 13;
      mockGetMangaSuccess({
        ...manga1,
        chaptersCount: freshChaptersACount,
      });
      mockGetChaptersSuccess([
        ...manga1Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        },
      ]);
      mockGetMangaSuccess({
        ...manga2,
        chaptersCount: freshChaptersBCount,
      });
      mockGetChaptersSuccess([
        ...manga2Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-b-12',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-b-12',
          title: `${defaultChapter.title} 12`,
          index: 12,
        },
      ]);
      mockSendEmailSuccess();

      const simulatedError = 'Simulated error';
      insertSpy.mockImplementationOnce(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValueOnce([{
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        }]),
      }) as any);
      insertSpy.mockImplementationOnce(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn()
          .mockRejectedValueOnce(new Error(simulatedError)),
      }) as any);

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(2);

      expect(updateSpy).toHaveBeenCalledWith(mangaTable);
      expect(updateSpy).toHaveBeenCalledTimes(2);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith({
        to: user1.email,
        subject: 'Epic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        html: '<img src=\"image-1\" /><br />\n<img src=\"image-2\" /><br /><br />\nEpic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        text: defaultChapter.url,
      });

      expect(result).toEqual({
        emailsSent: 1,
        updatedMangas: [{
          id: manga1.id,
          sourceName: manga1.sourceName,
          title: manga1.title,
          url: manga1.url,
          chapters: [expect.objectContaining({ index: 11 })],
          usersToNotify: [{
            id: user1.id,
            email: user1.email,
          }],
        }],
        errors: [{
          mangaId: manga2.id,
          mangaSourceName: manga2.sourceName,
          mangaTitle: manga2.title,
          message: 'Failed to insert new chapters in DB',
          error: expect.any(Object),
        }],
      });

      expect(loggerWriteSpy).toHaveBeenCalledTimes(11);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'info',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChaptersCount: 11,
        newChaptersCount: 12,
        msg: 'Manga has new chapters.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'info',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Manga has new chapters.',
        newChaptersCount: 13,
        oldChaptersCount: 12,
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'error',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Failed to insert new chapters in DB.',
        error: expect.any(Object),
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Found 1 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(11, {
        level: 'info',
        msg: 'Sent 1 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });
  });
});
