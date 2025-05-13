import { relations } from 'drizzle-orm';
import { index, integer, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

import { timestamps } from '@/lib/db/model/helpers';
import { mangaTable } from '@/lib/db/model/manga';

export const userTable = pgTable('user', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text(),
  email: text().unique(),
  emailVerified: timestamp({ mode: 'date' }),
  image: text(),
  telegramId: integer().unique(),

  ...timestamps,
}, userTable => [{
  telegramIdIdx: index('user_telegramId_idx').on(userTable.telegramId),
  emailIdx: index('client_email_idx').on(userTable.email),
}]);

export const userMangaTable = pgTable('user-manga', {
  userId: text()
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  mangaId: text()
    .references(() => mangaTable.id, { onDelete: 'cascade' })
    .notNull(),

  ...timestamps,
}, userMangaTable => [
  primaryKey({ columns: [userMangaTable.userId, userMangaTable.mangaId] }),
]);

export const userRelations = relations(userTable, ({ many }) => ({
  userMangas: many(userMangaTable),
}));

export const userMangaRelations = relations(userMangaTable, ({ one }) => ({
  user: one(userTable),
  manga: one(mangaTable),
}));
