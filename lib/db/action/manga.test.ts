import type { MangaInsert, User, UserInsert } from '@/lib/db/model';

import { db } from '@/lib/db';
import { listTrackedMangas, trackManga } from '@/lib/db/action/manga';
import { mangaTable, userMangaTable, userTable } from '@/lib/db/model';

const testUser: UserInsert = {
  name: 'Manga Tracker User',
  email: 'tracker@example.com',
  telegramId: 1001,
};

const testMangaData: MangaInsert = {
  sourceName: 'Test Source',
  sourceId: 'test-manga-001',
  title: 'The Great Test Manga',
  chaptersCount: 10,
  slug: 'the-great-test-manga',
  author: 'Test Author',
  artist: 'Test Artist',
  excerpt: 'An excerpt',
  image: 'http://example.com/image.jpg',
  url: 'http://example.com/manga',
  status: 'Ongoing',
  genres: ['action', 'test'],
  score: 8.5,
  releasedAt: new Date(),
};

describe('db -> action -> manga', () => {
  let createdUser: User;

  beforeEach(async () => {
    [createdUser] = await db.insert(userTable).values(testUser).returning();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('trackManga', () => {
    it('should track a new manga for a user successfully (manga not in DB)', async () => {
      const lastReadChapter = 0;
      const result = await trackManga(testMangaData, createdUser.telegramId, lastReadChapter);
      expect(result).toHaveProperty('success', true);

      const manga = await db.query.mangaTable.findFirst({
        where: (manga, { eq }) => eq(manga.sourceId, testMangaData.sourceId),
      });
      expect(manga).toBeDefined();
      if (typeof manga === 'undefined') {
        throw new TypeError('Invalid test');
      }
      expect(manga).toHaveProperty('title', testMangaData.title);

      const tracker = await db.query.userMangaTable.findFirst({
        where: (userManga, { and, eq }) => and(
          eq(userManga.userId, createdUser.id),
          eq(userManga.mangaId, manga.id),
        ),
      });
      expect(tracker).toBeDefined();
      if (typeof tracker === 'undefined') {
        throw new TypeError('Invalid test');
      }
      expect(tracker).toHaveProperty('lastReadChapter', lastReadChapter);
    });

    it('should track an existing manga for a user successfully (manga already in DB)', async () => {
      const [manga] = await db.insert(mangaTable).values(testMangaData).returning();

      const lastReadChapter = 1;
      const result = await trackManga(manga, createdUser.telegramId, lastReadChapter);
      expect(result).toHaveProperty('success', true);

      const tracker = await db.query.userMangaTable.findFirst({
        where: (userManga, { and, eq }) => and(
          eq(userManga.userId, createdUser.id),
          eq(userManga.mangaId, manga.id),
        ),
      });
      expect(tracker).toBeDefined();
      if (typeof tracker === 'undefined') {
        throw new TypeError('Invalid test');
      }
      expect(tracker).toHaveProperty('lastReadChapter', lastReadChapter);
    });

    it('should return invalidUser if the user does not exist', async () => {
      const nonExistentTelegramId = 9999;
      const result = await trackManga(testMangaData, nonExistentTelegramId, 0);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('invalidUser', true);
    });

    it('should return alreadyTracked if the manga is already tracked by the user', async () => {
      const lastReadChapter = 0;
      await trackManga(testMangaData, createdUser.telegramId, lastReadChapter);

      const result = await trackManga(testMangaData, createdUser.telegramId, lastReadChapter);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('alreadyTracked', true);
    });

    it('should return databaseError if inserting manga fails', async () => {
      const simulatedError = 'DB Error on Manga Insert';
      const insertMangaSpy = jest.spyOn(db, 'insert')
        .mockImplementationOnce(() => ({
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockRejectedValue(new Error(simulatedError) as never),
        } as any));

      const result = await trackManga(testMangaData, createdUser.telegramId, 0);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('databaseError', simulatedError);
      expect(insertMangaSpy).toHaveBeenCalledTimes(1);
    });

    it('should return databaseError if inserting userManga (tracker) fails', async () => {
      const simulatedError = 'DB Error on Tracker Insert';
      const insertUserMangaSpy = jest.spyOn(db, 'insert')
        .mockImplementationOnce(() => ({
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([testMangaData] as never),
        } as any))
        .mockImplementationOnce(() => ({
          values: jest.fn().mockRejectedValue(new Error(simulatedError) as never),
        } as any));

      const mangaInsertSpy = jest.spyOn(db, 'insert')
        .mockImplementationOnce(() => ({
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValueOnce([{ ...testMangaData, id: 'mocked-manga-id' }] as never), // Simula che il manga sia stato inserito
        } as any))
        .mockImplementationOnce(() => ({
          values: jest.fn().mockRejectedValueOnce(new Error(simulatedError) as never),
        } as any));

      const result = await trackManga(testMangaData, createdUser.telegramId, 0);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('databaseError', simulatedError);
      expect(insertUserMangaSpy).toHaveBeenCalledTimes(2);
      expect(mangaInsertSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('listTrackedMangas', () => {
    it('should return an empty array if user tracks no mangas', async () => {
      const mangas = await listTrackedMangas(createdUser.id);
      expect(mangas).toEqual([]);
    });

    it('should return a list of tracked mangas for the user, ordered by title', async () => {
      const manga1Data = { ...testMangaData, sourceId: 'manga001', title: 'Alpha Test Manga' };
      const manga2Data = { ...testMangaData, sourceId: 'manga002', title: 'Zulu Test Manga' };
      const manga3Data = { ...testMangaData, sourceId: 'manga003', title: 'Beta Test Manga' };

      const [manga1] = await db.insert(mangaTable).values(manga1Data).returning();
      const [manga2] = await db.insert(mangaTable).values(manga2Data).returning();
      const [manga3] = await db.insert(mangaTable).values(manga3Data).returning();

      await db.insert(userMangaTable).values([
        { userId: createdUser.id, mangaId: manga1.id, lastReadChapter: 0 },
        { userId: createdUser.id, mangaId: manga2.id, lastReadChapter: 0 },
        { userId: createdUser.id, mangaId: manga3.id, lastReadChapter: 0 },
      ]);

      const tracked = await listTrackedMangas(createdUser.id);
      expect(tracked).toHaveLength(3);
      expect(tracked).toHaveProperty('0.title', 'Alpha Test Manga');
      expect(tracked).toHaveProperty('0.id', manga1.id);
      expect(tracked).toHaveProperty('1.title', 'Beta Test Manga');
      expect(tracked).toHaveProperty('1.id', manga3.id);
      expect(tracked).toHaveProperty('2.title', 'Zulu Test Manga');
      expect(tracked).toHaveProperty('2.id', manga2.id);
    });

    it('should return an empty array if user ID does not exist (no entries in userMangaTable)', async () => {
      const mangas = await listTrackedMangas('non-existent-user-id');
      expect(mangas).toEqual([]);
    });
  });
});
