import type { User } from '@/lib/db/model';

import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { userTable } from '@/lib/db/model';
import { createChildLogger } from '@/lib/log';
import { userValidation } from '@/lib/validation/user';

const logger = createChildLogger('db:action:user');

export interface UpsertInput {
  telegramId: number;
  name: string;
  email: string;
}

export type UpsertOutput = {
  success: true;
} | {
  success: false;
  validationErrors?: { field: string; error: string }[];
  databaseError?: string;
};

export async function upsertUser(newUser: UpsertInput): Promise<UpsertOutput> {
  const parsingResult = userValidation.safeParse(newUser);
  if (!parsingResult.success) {
    logger.error('[upsertUser] Validation error:', parsingResult.error);

    return {
      success: false,
      validationErrors: Object.entries(parsingResult.error.flatten().fieldErrors).map(([field, errors]) => ({ field, error: errors.join(', ') })),
    };
  }

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.telegramId, newUser.telegramId),
  });

  try {
    if (user) {
      await db.update(userTable).set(newUser).where(eq(userTable.id, user.id));
    } else {
      await db.insert(userTable).values(newUser);
    }
  } catch (error) {
    logger.error('[upsertUser] Database error:', error);

    return { success: false, databaseError: (error as Error).message };
  }

  return { success: true };
}

export async function findUserByTelegramId(telegramId: number): Promise<User | undefined> {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.telegramId, telegramId),
  });

  return user;
}
