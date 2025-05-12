import { integer, jsonb, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { timestamps } from '@/lib/db/model/helpers';

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
  score: integer(),
  chaptersCount: integer(),
  ...timestamps,
});
