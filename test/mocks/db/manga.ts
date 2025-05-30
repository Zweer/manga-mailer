import type { Manga } from '@/lib/db/model';

import { listTrackedMangas, removeTrackedManga, trackManga } from '@/lib/db/action/manga';
import { defaultManga } from '@/test/mocks/manga';

// jest.mock('@/lib/db/action/manga', () => ({
//   listTrackedMangas: jest.fn(),
//   removeTrackedManga: jest.fn(),
//   trackManga: jest.fn(),
// }));

export const mockedListTrackedMangas = jest.mocked(listTrackedMangas);
export const mockedTrackManga = jest.mocked(trackManga);
export const mockedRemoveTrackedManga = jest.mocked(removeTrackedManga);

export function mockListTrackedMangasSuccess(partialMangas: Partial<Manga>[] = []): Manga[] {
  const mangas: Manga[] = partialMangas.map(manga => ({ ...defaultManga, ...manga }));
  mockedListTrackedMangas.mockResolvedValue(mangas);

  return mangas;
}

export function mockTrackMangaSuccess(): void {
  mockedTrackManga.mockResolvedValue({ success: true });
}
export function mockTrackMangaInvalidUser(): void {
  mockedTrackManga.mockResolvedValue({ success: false, alreadyTracked: false });
}
export function mockTrackMangaAlreadyTracked(): void {
  mockedTrackManga.mockResolvedValue({ success: false, alreadyTracked: true });
}
export function mockTrackMangaDbError(databaseError = 'DB error'): void {
  mockedTrackManga.mockResolvedValue({ success: false, alreadyTracked: false, databaseError });
}

export function mockRemoveTrackedMangaSuccess(): void {
  mockedRemoveTrackedManga.mockResolvedValue({ success: true });
}
export function mockRemoveTrackedMangaNotFound(): void {
  mockedRemoveTrackedManga.mockResolvedValue({ success: false, notFound: true });
}
export function mockRemoveTrackedMangaDbError(databaseError = 'DB error'): void {
  mockedRemoveTrackedManga.mockResolvedValue({ success: false, notFound: false, databaseError });
}
