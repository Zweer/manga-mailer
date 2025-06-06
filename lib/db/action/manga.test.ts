import type { MockInstance } from 'vitest';

import type { Manga, User } from '@/lib/db/model';

import { and, eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';
import { listTrackedMangas, removeTrackedManga, trackManga } from '@/lib/db/action/manga';
import { mangaTable, userMangaTable, userTable } from '@/lib/db/model';
import { defaultUser } from '@/test/mocks/db/user';
import { defaultManga } from '@/test/mocks/manga';

describe('db -> action -> manga', () => {
  let createdUser: User;
  let insertSpy: MockInstance<typeof db.insert>;
  let deleteSpy: MockInstance<typeof db.delete>;

  beforeEach(async () => {
    [createdUser] = await db.insert(userTable).values(defaultUser).returning();
    insertSpy = vi.spyOn(db, 'insert');
    deleteSpy = vi.spyOn(db, 'delete');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('trackManga', () => {
    it('should track a new manga for a user successfully (manga not in DB)', async () => {
      const lastReadChapter = 0;
      const result = await trackManga(defaultManga, createdUser.id, lastReadChapter);
      expect(result).toHaveProperty('success', true);

      const manga = await db.query.mangaTable.findFirst({
        where: (manga, { eq }) => eq(manga.sourceId, defaultManga.sourceId),
      });
      expect(manga).toBeDefined();
      if (typeof manga === 'undefined') {
        throw new TypeError('Invalid test');
      }
      expect(manga).toHaveProperty('title', defaultManga.title);

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
      const [manga] = await db.insert(mangaTable).values(defaultManga).returning();

      const lastReadChapter = 1;
      const result = await trackManga(manga, createdUser.id, lastReadChapter);
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
      const nonExistentUserId = 'user-id';
      const result = await trackManga(defaultManga, nonExistentUserId, 0);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('alreadyTracked', false);
      expect(result).toHaveProperty('databaseError', 'insert or update on table "user-manga" violates foreign key constraint "user-manga_userId_user_id_fk"');
    });

    it('should return alreadyTracked if the manga is already tracked by the user', async () => {
      const lastReadChapter = 0;
      await trackManga(defaultManga, createdUser.id, lastReadChapter);

      const result = await trackManga(defaultManga, createdUser.id, lastReadChapter);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('alreadyTracked', true);
      expect(result).not.toHaveProperty('databaseError');
    });

    it('should return databaseError if inserting manga fails', async () => {
      const simulatedError = 'DB Error on Manga Insert';
      insertSpy.mockImplementationOnce(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error(simulatedError) as never),
      } as any));

      const result = await trackManga(defaultManga, createdUser.id, 0);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('alreadyTracked', false);
      expect(result).toHaveProperty('databaseError', simulatedError);

      expect(insertSpy).toHaveBeenCalledTimes(1);
    });

    it('should return databaseError if inserting userManga (tracker) fails', async () => {
      const simulatedError = 'DB Error on Tracker Insert';
      insertSpy.mockImplementationOnce(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([defaultManga] as never),
      } as any))
        .mockImplementationOnce(() => ({
          values: vi.fn().mockRejectedValue(new Error(simulatedError) as never),
        } as any))
        .mockImplementationOnce(() => ({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValueOnce([{ ...defaultManga, id: 'mocked-manga-id' }] as never),
        } as any))
        .mockImplementationOnce(() => ({
          values: vi.fn().mockRejectedValueOnce(new Error(simulatedError) as never),
        } as any));

      const result = await trackManga(defaultManga, createdUser.id, 0);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('alreadyTracked', false);
      expect(result).toHaveProperty('databaseError', simulatedError);

      expect(insertSpy).toHaveBeenCalledTimes(2);
      expect(insertSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeTrackedManga', () => {
    let manga1: Manga;
    let manga2: Manga;

    beforeEach(async () => {
      [manga1] = await db.insert(mangaTable).values({
        ...defaultManga,
        id: 'manga-id-123-1',
        sourceId: 'manga-to-remove-1',
        title: 'Manga To Remove 1',
      }).returning();
      [manga2] = await db.insert(mangaTable).values({
        ...defaultManga,
        id: 'manga-id-123-2',
        sourceId: 'manga-to-keep-1',
        title: 'Manga To Keep 1',
      }).returning();

      await db.insert(userMangaTable).values([
        { userId: createdUser.id, mangaId: manga1.id, lastReadChapter: 1 },
        { userId: createdUser.id, mangaId: manga2.id, lastReadChapter: 1 },
      ]);
    });

    it('should successfully remove a tracked manga for a user', async () => {
      // Verifica che il tracker esista prima
      let tracker = await db.query.userMangaTable.findFirst({
        where: and(eq(userMangaTable.userId, createdUser.id), eq(userMangaTable.mangaId, manga1.id)),
      });
      expect(tracker).toBeDefined();

      const result = await removeTrackedManga(createdUser.id, manga1.id);
      expect(result.success).toBe(true);

      // Verifica che il tracker sia stato rimosso
      tracker = await db.query.userMangaTable.findFirst({
        where: and(eq(userMangaTable.userId, createdUser.id), eq(userMangaTable.mangaId, manga1.id)),
      });
      expect(tracker).toBeUndefined();

      // Verifica che l'altro tracker esista ancora
      const otherTracker = await db.query.userMangaTable.findFirst({
        where: and(eq(userMangaTable.userId, createdUser.id), eq(userMangaTable.mangaId, manga2.id)),
      });
      expect(otherTracker).toBeDefined();
    });

    it('should return notFound if the user is not tracking the specified manga', async () => {
      const nonTrackedMangaId = 'non-tracked-manga-id'; // Un ID di un manga che l'utente non traccia
      const result = await removeTrackedManga(createdUser.id, nonTrackedMangaId);
      expect(result.success).toBe(false);
      if (result.success)
        throw new Error('Test should have failed');
      expect(result.notFound).toBe(true);
    });

    it('should return notFound if the user ID does not exist', async () => {
      const nonExistentUserId = 'non-existent-user-id';
      const result = await removeTrackedManga(nonExistentUserId, manga1.id);
      expect(result.success).toBe(false);
      if (result.success) {
        throw new Error('Test should have failed');
      }
      expect(result.notFound).toBe(true); // Perché il findFirst non troverà la combinazione
    });

    it('should return databaseError if db.delete fails', async () => {
      const simulatedError = 'DB Error on Delete';
      deleteSpy.mockImplementationOnce(
        () => ({
          where: vi.fn().mockRejectedValue(new Error(simulatedError)),
        } as any),
      );

      const result = await removeTrackedManga(createdUser.id, manga1.id);

      expect(result.success).toBe(false);
      if (result.success) {
        throw new Error('Test should have failed');
      }
      expect(result.databaseError).toBe(simulatedError);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('listTrackedMangas', () => {
    it('should return an empty array if user tracks no mangas', async () => {
      const mangas = await listTrackedMangas(createdUser.id);
      expect(mangas).toEqual([]);
    });

    it('should return a list of tracked mangas for the user, ordered by title', async () => {
      const manga1Data = { ...defaultManga, id: 'manga-id-123-1', sourceId: 'manga001', title: 'Alpha Test Manga' };
      const manga2Data = { ...defaultManga, id: 'manga-id-123-2', sourceId: 'manga002', title: 'Zulu Test Manga' };
      const manga3Data = { ...defaultManga, id: 'manga-id-123-3', sourceId: 'manga003', title: 'Beta Test Manga' };

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
