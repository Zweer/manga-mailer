import type { Mock } from 'vitest';

import { NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loggerWriteSpy } from '@/test/log';

import { GET } from './route';

const mockedMangaUpdater = vi.hoisted(() => vi.fn().mockResolvedValue({
  emailsSent: 0,
  updatedMangas: [],
  errors: [],
}));

vi.mock('@/lib/service/mangaUpdater', () => ({
  mangaUpdater: mockedMangaUpdater,
}));

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((body, init) => ({
        json: async () => body,
        status: init?.status ?? 200,
        ok: (init?.status ?? 200) < 400,
      })),
    },
  };
});

// eslint-disable-next-line ts/unbound-method
const mockedNextResponseJson = NextResponse.json as Mock;

describe('aPI Route: /api/cron/manga-updates (GET)', () => {
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-secret';
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret;
  });

  function createMockRequest(authorizationHeader?: string): Request {
    const headers = new Headers();
    if (typeof authorizationHeader !== 'undefined') {
      headers.set('authorization', authorizationHeader);
    }
    return {
      headers,
    } as Request;
  }

  it('should return 401 Unauthorized if CRON_SECRET is set and not provided or incorrect', async () => {
    const requestWithoutAuth = createMockRequest();
    await GET(requestWithoutAuth);
    expect(mockedNextResponseJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });

    expect(loggerWriteSpy).toHaveBeenCalledTimes(2);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      msg: 'Manga update cron job triggered.',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'warn',
      msg: 'Unauthorized attempt to trigger cron job.',
      serviceName: 'api:cron:manga-updates',
    });

    const requestWithWrongAuth = createMockRequest('Bearer wrong-secret');
    await GET(requestWithWrongAuth);
    expect(mockedNextResponseJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
  });

  it('should call mangaUpdater and return success if authorization is valid', async () => {
    const mockUpdaterResult = {
      emailsSent: 5,
      updatedMangas: [{ title: 'Manga X', chapters: [{ index: 1 }] }],
      errors: [],
    };
    mockedMangaUpdater.mockResolvedValue(mockUpdaterResult);
    const request = createMockRequest(`Bearer ${process.env.CRON_SECRET}`);

    await GET(request);

    expect(mockedMangaUpdater).toHaveBeenCalledTimes(1);
    expect(mockedNextResponseJson).toHaveBeenCalledWith({
      message: 'Manga update process finished.',
      details: {
        emailsSent: 5,
        updatedMangas: [{
          title: 'Manga X',
          chapters: [{ index: 1 }],
        }],
        errors: [],
      },
    });

    expect(loggerWriteSpy).toHaveBeenCalledTimes(3);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      msg: 'Manga update cron job triggered.',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'info',
      msg: 'Starting mangaUpdater service...',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
      level: 'info',
      msg: 'Manga updater service finished.',
      emailsSent: 5,
      errorsCount: 0,
      updatedMangasCount: 1,
      serviceName: 'api:cron:manga-updates',
    });
  });

  it('should return 500 if mangaUpdater throws an error', async () => {
    const errorMessage = 'Updater failed catastrophically';
    mockedMangaUpdater.mockRejectedValue(new Error(errorMessage));
    const request = createMockRequest(`Bearer ${process.env.CRON_SECRET}`);

    await GET(request);

    expect(mockedMangaUpdater).toHaveBeenCalledTimes(1);
    expect(mockedNextResponseJson).toHaveBeenCalledWith(
      { error: 'Failed to run manga update process', details: errorMessage },
      { status: 500 },
    );

    expect(loggerWriteSpy).toHaveBeenCalledTimes(3);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      msg: 'Manga update cron job triggered.',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'info',
      msg: 'Starting mangaUpdater service...',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
      error: expect.any(Object),
      level: 'error',
      msg: 'Critical error in manga update cron job API handler.',
      serviceName: 'api:cron:manga-updates',
    });
  });

  it('should proceed if CRON_SECRET is not set (environment without secret)', async () => {
    // @ts-expect-error I should delete the secret to see if the no-auth is handled correctly
    delete process.env.CRON_SECRET;
    mockedMangaUpdater.mockResolvedValue({ emailsSent: 0, updatedMangas: [], errors: [] });
    const request = createMockRequest();

    await GET(request);

    expect(mockedMangaUpdater).toHaveBeenCalledTimes(1);
    expect(mockedNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Manga update process finished.' }),
    );

    expect(loggerWriteSpy).toHaveBeenCalledTimes(3);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      msg: 'Manga update cron job triggered.',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'info',
      msg: 'Starting mangaUpdater service...',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
      level: 'info',
      msg: 'Manga updater service finished.',
      emailsSent: 0,
      errorsCount: 0,
      updatedMangasCount: 0,
      serviceName: 'api:cron:manga-updates',
    });
  });
});
