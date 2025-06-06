import { relations } from 'drizzle-orm';
import { index, integer, jsonb, pgEnum, pgTable, real, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { timestamps } from '@/lib/db/model/helpers';
import { userMangaTable } from '@/lib/db/model/user';

export const statusType = pgEnum('type', [
  'Ongoing',
  'Completed',
  'Hiatus',
  'Cancelled',
  'Unknown',
]);
export const mangaTable = pgTable('manga', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sourceName: text().notNull(),
  sourceId: text().notNull(),
  slug: text(),
  title: text(),
  author: text(),
  artist: text(),
  excerpt: text(),
  image: text(),
  url: text(),
  releasedAt: timestamp({ mode: 'date' }),
  status: statusType(),
  genres: jsonb().$type<string[]>(),
  score: real(),
  lastCheckedAt: timestamp({ mode: 'date' }),
  chaptersCount: integer(),
  ...timestamps,
}, mangaTable => [
  {
    sourceUniqueIndex: uniqueIndex('manga_unique_source_idx').on(mangaTable.sourceName, mangaTable.sourceId),
    lastCheckedAtIndex: index('manga_last_checked_at_idx').on(mangaTable.lastCheckedAt),
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
  url: text(),
  releasedAt: timestamp({ mode: 'date' }),
  images: jsonb().$type<string[]>(),
  ...timestamps,
}, chapterTable => [
  {
    sourceUniqueIndex: uniqueIndex('chapter_unique_source_idx').on(chapterTable.sourceName, chapterTable.sourceId),
    mangaIdIndex: index('chapter_manga_id_idx').on(chapterTable.mangaId),
  },
]);
export type ChapterInsert = typeof chapterTable.$inferInsert;
export type Chapter = typeof chapterTable.$inferSelect;

export const mangaRelations = relations(mangaTable, ({ many }) => ({
  userMangas: many(userMangaTable),
  chapters: many(chapterTable),
}));

export const chapterRelations = relations(chapterTable, ({ one }) => ({
  manga: one(mangaTable, {
    fields: [chapterTable.mangaId],
    references: [mangaTable.id],
  }),
}));
