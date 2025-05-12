import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { timestamps } from '@/lib/db/model/helpers';

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
