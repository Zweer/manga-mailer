import { afterEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';
import { findUserByTelegramId, upsertUser } from '@/lib/db/action/user';
import { userTable } from '@/lib/db/model';

describe('db -> action -> user', () => {
  const name = 'Test User vi';
  const email = 'testvi@example.com';
  const telegramId = 123;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findUserByTelegramId', () => {
    it('should return undefined if user is not found', async () => {
      const user = await findUserByTelegramId(12345);
      expect(user).toBeUndefined();
    });

    it('should return the user found by telegramId', async () => {
      const newUser = { name, email, telegramId };
      await db.insert(userTable).values(newUser);

      const foundUser = await findUserByTelegramId(telegramId);
      expect(foundUser).toBeDefined();
      expect(foundUser).toHaveProperty('name', name);
      expect(foundUser).toHaveProperty('email', email);
      expect(foundUser).toHaveProperty('telegramId', telegramId);
    });
  });

  describe('upsertUser', () => {
    it('should insert a new user if telegramId does not exist', async () => {
      const newUser = { name, email, telegramId };
      const result = await upsertUser(newUser);
      expect(result).toHaveProperty('success', true);

      const dbUser = await db.query.userTable.findFirst({
        where: (user, { eq }) => eq(user.telegramId, telegramId),
      });
      expect(dbUser).toBeDefined();
      expect(dbUser).toHaveProperty('name', name);
      expect(dbUser).toHaveProperty('email', email);
      expect(dbUser).toHaveProperty('telegramId', telegramId);
    });

    it('should update an existing user if telegramId exists', async () => {
      const newUser = { name, email, telegramId };
      await db.insert(userTable).values(newUser);

      const newEmail = 'new_email@example.com';
      const updatedUserInput = {
        ...newUser,
        email: newEmail,
      };
      const result = await upsertUser(updatedUserInput);
      expect(result).toHaveProperty('success', true);

      const dbUser = await db.query.userTable.findFirst({
        where: (user, { eq }) => eq(user.telegramId, telegramId),
      });
      expect(dbUser).toBeDefined();
      expect(dbUser).toHaveProperty('name', name);
      expect(dbUser).toHaveProperty('email', newEmail);
      expect(dbUser).toHaveProperty('telegramId', telegramId);
    });

    it('should return validation error for invalid email', async () => {
      const newEmail = 'invalid-email';
      const invalidUser = {
        name,
        email: newEmail,
        telegramId,
      };
      const result = await upsertUser(invalidUser);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Unexpected success');
      }
      expect(result).toHaveProperty('validationErrors');
      expect(result).toHaveProperty('validationErrors.0.field', 'email');
      expect(result).toHaveProperty('validationErrors.0.error', 'Invalid email address');
    });

    it('should return databaseError if db.insert fails', async () => {
      const newUser = { name, email, telegramId };

      const simulatedError = 'Simulated DB Insert Error';
      const insertSpy = vi.spyOn(db, 'insert').mockImplementationOnce(() => ({
        values: vi.fn().mockRejectedValue(new Error(simulatedError)),
      }) as any);

      const result = await upsertUser(newUser);

      expect(result.success).toBe(false);
      if (result.success) {
        throw new Error('Unexpected success');
      }
      expect(result.databaseError).toBe(simulatedError);
      expect(insertSpy).toHaveBeenCalledTimes(1);
    });

    it('should return databaseError if db.update fails', async () => {
      const newUser = { name, email, telegramId };
      await db.insert(userTable).values(newUser);

      const updatedInput = {
        ...newUser,
        name: 'New Name For Update Error',
      };

      const simulatedError = 'Simulated DB Insert Error';
      const updateSpy = vi.spyOn(db, 'update').mockImplementationOnce(() => ({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockRejectedValue(new Error(simulatedError)),
      }) as any);

      const result = await upsertUser(updatedInput);

      expect(result.success).toBe(false);
      if (result.success) {
        throw new Error('Unexpected success');
      }
      expect(result.databaseError).toBe(simulatedError);
      expect(updateSpy).toHaveBeenCalledTimes(1);
    });
  });
});
