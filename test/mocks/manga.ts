import type { ConnectorNames } from '@zweer/manga-scraper';

import type { Chapter, Manga, MangaInsert } from '@/lib/db/model';
import type { MangaAutocomplete } from '@/lib/manga';

import { vi } from 'vitest';

import { getChapter, getChapters, getManga, searchMangas } from '@/lib/manga';

// vi.mock('@/lib/manga', () => ({
//   getManga: vi.fn(),
//   searchMangas: vi.fn(),
//   getChapters: vi.fn(),
//   getChapter: vi.fn(),
// }));

export const mockedGetManga = vi.mocked(getManga);
export const mockedSearchMangas = vi.mocked(searchMangas);
export const mockedGetChapters = vi.mocked(getChapters);
export const mockedGetChapter = vi.mocked(getChapter);

export const testConnectorNameA = 'TestConnectorA' as ConnectorNames;

export const defaultManga: Manga = {
  id: 'manga-id-123',
  sourceName: testConnectorNameA,
  sourceId: 'manga-source-id-123',
  title: 'Epic Adventure Manga',
  chaptersCount: 10,
  slug: 'epic-adventure',
  author: 'A. Uthor',
  artist: 'A. Rtist',
  excerpt: 'An epic excerpt.',
  image: 'url.jpg',
  url: 'manga.url',
  status: 'Ongoing',
  genres: ['action'],
  score: 0,
  releasedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  lastCheckedAt: new Date(),
};

export const defaultChapter: Chapter = {
  id: 'chapter-id-123',
  sourceName: testConnectorNameA,
  sourceId: 'chapter-source-id-123',
  mangaId: 'manga-id-123',
  title: 'Epic Adventure Chapter',
  index: 1,
  url: 'chapter.url',
  releasedAt: new Date(),
  images: ['image-1', 'image-2'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function mockGetMangaSuccess(partialManga: Partial<MangaInsert> = {}): Manga {
  const manga: Manga = { ...defaultManga, ...partialManga };
  mockedGetManga.mockResolvedValueOnce(manga);

  return manga;
}
export function mockGetMangaConnectorError(message = 'Invalid connector name'): void {
  mockedGetManga.mockRejectedValueOnce(new Error(message));
}

export function mockSearchMangaSuccess(partialAutocompleteMangas: Partial<MangaAutocomplete>[] = []): MangaAutocomplete[] {
  const autocompleteMangas: MangaAutocomplete[] = partialAutocompleteMangas.map(manga => ({
    connectorName: testConnectorNameA,
    id: defaultManga.sourceId,
    title: defaultManga.title as string,
    chaptersCount: defaultManga.chaptersCount as number,
    ...manga,
  }));
  mockedSearchMangas.mockResolvedValueOnce(autocompleteMangas);

  return autocompleteMangas;
}
export function mockSearchMangaError(message = 'Search error'): void {
  mockedSearchMangas.mockRejectedValueOnce(new Error(message));
}

export function mockGetChaptersSuccess(partialChapters: Partial<Chapter>[] = []): Chapter[] {
  const chapters: Chapter[] = partialChapters.map(chapter => ({ ...defaultChapter, ...chapter }));
  mockedGetChapters.mockResolvedValueOnce(chapters);

  return chapters;
}
export function mockGetChaptersError(message = 'Fetch error'): void {
  mockedGetChapters.mockRejectedValueOnce(new Error(message));
}

export function mockGetChapterSuccess(partialChapter: Partial<Chapter> = {}): Chapter {
  const chapter: Chapter = { ...defaultChapter, ...partialChapter };
  mockedGetChapter.mockResolvedValueOnce(chapter);

  return chapter;
}
export function mockGetChapterError(message = 'Fetch error'): void {
  mockedGetChapter.mockRejectedValueOnce(new Error(message));
}
