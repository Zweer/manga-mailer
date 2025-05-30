import { resolve } from 'node:path';

import { PgTable } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';

import * as schema from '@/lib/db/model';

export const testDb = drizzle({ schema, logger: false });

jest.mock('@/lib/db', () => ({
  __esModule: true,
  db: testDb,
}));

jest.mock('@/lib/log');

async function applyMigrations() {
  const migrationsFolder = resolve(__dirname, '..', 'drizzle');

  await migrate(testDb, { migrationsFolder });
}

export async function resetDatabase() {
  await Object.values(schema)
    .filter(table => table instanceof PgTable)
    .reduce(async (promise, table) => {
      await promise;
      await testDb.delete(table);
    }, Promise.resolve());
}

beforeAll(async () => {
  await applyMigrations();
});

beforeEach(async () => {
  await resetDatabase();
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});
