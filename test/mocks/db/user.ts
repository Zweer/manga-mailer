import type { User } from '@/lib/db/model';

import { vi } from 'vitest';

import { findUserByTelegramId, upsertUser } from '@/lib/db/action/user';

// vi.mock('@/lib/db/action/user', () => ({
//   findUserByTelegramId: vi.fn(),
//   upsertUser: vi.fn(),
// }));

export const mockedFindUserByTelegramId = vi.mocked(findUserByTelegramId);
export const mockedUpsertUser = vi.mocked(upsertUser);

export const defaultUser: User = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  telegramId: 12345,
  createdAt: new Date(),
  updatedAt: null,
  emailVerified: null,
  image: null,
};
export function mockFindUserByTelegramIdSuccess(partialUser: Partial<User> = {}): User {
  const user: User = { ...defaultUser, ...partialUser };
  mockedFindUserByTelegramId.mockResolvedValue(user);

  return user;
}
export function mockFindUserByTelegramIdNotFound(): void {
  mockedFindUserByTelegramId.mockResolvedValue(undefined);
}

export function mockUpsertUserSuccess(): void {
  mockedUpsertUser.mockResolvedValue({ success: true });
}
export function mockUpsertUserValidationError(validationErrors = [{ field: 'email', error: 'Invalid format' }]): void {
  mockedUpsertUser.mockResolvedValue({ success: false, validationErrors });
}
export function mockUpsertUserDbError(databaseError = 'DB error'): void {
  mockedUpsertUser.mockResolvedValue({ success: false, databaseError });
}
