import type { User, UserInsert } from '@/lib/db/model';
import type { OutputError, OutputSuccess } from '@/lib/types';

import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import * as z from 'zod/v4';

import { db } from '@/lib/db';
import { userTable } from '@/lib/db/model';
import { createLogger } from '@/lib/logger';

const logger = createLogger('lib:db:service:manga');

const userInsertSchema = createInsertSchema(userTable, {
  email: () => z.email().toLowerCase(),
});
const userUpdateSchema = createUpdateSchema(userTable, {
  email: () => z.email().toLowerCase(),
});

export async function getUserByTelegramId(telegramId: number): Promise<User | undefined> {
  return db.query.userTable.findFirst({
    where: (userTable, { eq }) => eq(userTable.telegramId, telegramId),
  });
}

interface OutputUserSuccess extends OutputSuccess {
  user: User;
}

type OutputUser = OutputUserSuccess | OutputError;

export async function insertUser(user: UserInsert): Promise<OutputUser> {
  const parsingResult = userSchema.safeParse(user);
  if (!parsingResult.success) {
    logger.error({ moduleName: 'insertUser' }, 'Validation error:', parsingResult.error);

    return {
      success: false,
      validationErrors: Object.entries(parsingResult.error.flatten().fieldErrors).map(([field, errors]) => ({ field, error: errors.join(', ') })),
    };
  }

  try {
    const [createdUser] = await db.insert(userTable).values(user).returning();

    return { success: true, user: createdUser };
  } catch (error) {
    logger.error({ moduleName: 'insertUser' }, 'Database error:', error);

    return { success: false, databaseError: (error as Error).message };
  }
}
