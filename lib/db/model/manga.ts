import { relations } from 'drizzle-orm';
import { integer, jsonb, pgEnum, pgTable, real, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

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
  genres: jsonb('genres').$type<string[]>(),
  score: real(),
  chaptersCount: integer(),
  ...timestamps,
}, mangaTable => [
  {
    sourceUniqueIndex: uniqueIndex('manga_unique_source_idx').on(mangaTable.sourceName, mangaTable.sourceId),
  },
]);

export const mangaRelations = relations(mangaTable, ({ many }) => ({
  userMangas: many(userMangaTable),
}));
