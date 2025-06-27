import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { timestamps } from '@/lib/db/model/helpers';
import { userTable } from '@/lib/db/model/user';

export const mangaTable = pgTable('manga', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sourceName: text().notNull(),
  sourceId: text().notNull(),
  title: text().notNull(),
  slug: text().notNull().unique(),
  chaptersCount: integer().notNull(),
  lastCheckedAt: timestamp({ mode: 'date' }),
  ...timestamps,
}, manga => [
  {
    sourceUniqueIndex: uniqueIndex('source_unique_index').on(manga.sourceName, manga.sourceId),
    slugIndex: uniqueIndex('slug_index').on(manga.slug),
    lastCheckedAtIndex: index('last_checked_at_index').on(manga.lastCheckedAt),
  },
]);
export type MangaInsert = typeof mangaTable.$inferInsert;
export type Manga = typeof mangaTable.$inferSelect;

export const chapterTable = pgTable('chapter', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sourceName: text().notNull(),
  sourceId: text().notNull(),
  mangaId: text()
    .references(() => mangaTable.id, { onDelete: 'cascade' })
    .notNull(),
  title: text(),
  index: real(),
  releasedAt: timestamp({ withTimezone: true }),
  images: jsonb().$type<string[]>(),
  ...timestamps,
}, chapter => [
  {
    sourceUniqueIndex: uniqueIndex('source_unique_index').on(chapter.sourceName, chapter.sourceId),
    mangaIdIndex: index('manga_id_index').on(chapter.mangaId),
  },
]);
export type ChapterInsert = typeof chapterTable.$inferInsert;
export type Chapter = typeof chapterTable.$inferSelect;

export const watchlistTable = pgTable('watchlist', {
  userId: text()
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  mangaId: text()
    .references(() => mangaTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timestamps,
}, watchlist => [
  primaryKey({ columns: [watchlist.userId, watchlist.mangaId] }),
]);

export const mangaRelations = relations(mangaTable, ({ many }) => ({
  userMangas: many(watchlistTable),
  chapters: many(chapterTable),
}));

export const chapterRelations = relations(chapterTable, ({ one }) => ({
  manga: one(mangaTable, {
    fields: [chapterTable.mangaId],
    references: [mangaTable.id],
  }),
}));

export const watchlistRelations = relations(watchlistTable, ({ one }) => ({
  user: one(userTable, {
    fields: [watchlistTable.userId],
    references: [userTable.id],
  }),
  manga: one(mangaTable, {
    fields: [watchlistTable.mangaId],
    references: [mangaTable.id],
  }),
}));
