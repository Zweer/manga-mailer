import type { User } from '@/lib/db/model';

import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { userTable } from '@/lib/db/model';
import { userValidation } from '@/lib/validation/user';

interface UpsertInput {
  telegramId: number;
  name: string;
  email: string;
}

type UpsertOutput = {
  success: true;
} | {
  success: false;
  validationError?: { field: string; error: string }[];
  databaseError?: string;
};

export async function upsertUser(newUser: UpsertInput): Promise<UpsertOutput> {
  const parsingResult = userValidation.safeParse(newUser);
  if (!parsingResult.success) {
    console.error('[action:user:upsertUser] Validation error:', parsingResult.error);

    return {
      success: false,
      validationError: Object.entries(parsingResult.error.flatten().fieldErrors).map(([field, errors]) => ({ field, error: errors.join(', ') })),
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
    console.error('[action:user:upsertUser] Database error:', error);

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
