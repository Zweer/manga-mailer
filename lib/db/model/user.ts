import type { AdapterAccountType } from 'next-auth/adapters';

import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const userTable = pgTable('user', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text(),
  email: text().unique(),
  emailVerified: timestamp({ mode: 'date' }),
  image: text(),
});

export const accountTable = pgTable('account', {
  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  type: text().$type<AdapterAccountType>().notNull(),
  provider: text().notNull(),
  providerAccountId: text().notNull(),
  refresh_token: text(),
  access_token: text(),
  expires_at: integer(),
  token_type: text(),
  scope: text(),
  id_token: text(),
  session_state: text(),
}, account => [
  {
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  },
]);

export const sessionTable = pgTable('session', {
  sessionToken: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  expires: timestamp({ mode: 'date' }).notNull(),
});

export const verificationTokenTable = pgTable('verificationToken', {
  identifier: text().notNull(),
  token: text().notNull(),
  expires: timestamp({ mode: 'date' }).notNull(),
}, verificationToken => [
  {
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  },
]);

export const authenticatorTable = pgTable('authenticator', {
  credentialID: text().notNull().unique(),
  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  providerAccountId: text().notNull(),
  credentialPublicKey: text().notNull(),
  counter: integer().notNull(),
  credentialDeviceType: text().notNull(),
  credentialBackedUp: boolean().notNull(),
  transports: text(),
}, authenticator => [
  {
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  },
]);
