import { relations } from 'drizzle-orm';
import { index, integer, pgTable, primaryKey, real, text, timestamp } from 'drizzle-orm/pg-core';

import { timestamps } from '@/lib/db/model/helpers';
import { mangaTable } from '@/lib/db/model/manga';

export const userTable = pgTable('user', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: timestamp({ mode: 'date' }),
  image: text(),
  telegramId: integer().notNull().unique(),

  ...timestamps,
}, userTable => [{
  telegramIdIdx: index('user_telegramId_idx').on(userTable.telegramId),
  emailIdx: index('client_email_idx').on(userTable.email),
}]);
export type UserInsert = typeof userTable.$inferInsert;
export type User = typeof userTable.$inferSelect;

export const userMangaTable = pgTable('user-manga', {
  userId: text()
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  mangaId: text()
    .references(() => mangaTable.id, { onDelete: 'cascade' })
    .notNull(),

  lastReadChapter: real().notNull().default(0),

  ...timestamps,
}, userMangaTable => [
  primaryKey({ columns: [userMangaTable.userId, userMangaTable.mangaId] }),
]);
export type UserMangaInsert = typeof userMangaTable.$inferInsert;
export type UserManga = typeof userMangaTable.$inferSelect;

export const userRelations = relations(userTable, ({ many }) => ({
  userMangas: many(userMangaTable),
}));

export const userMangaRelations = relations(userMangaTable, ({ one }) => ({
  user: one(userTable),
  manga: one(mangaTable),
}));
