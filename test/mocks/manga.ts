import type { ConnectorNames } from '@zweer/manga-scraper';

import type { Manga, MangaInsert } from '@/lib/db/model';
import type { MangaAutocomplete } from '@/lib/manga';

import { getManga, searchMangas } from '@/lib/manga';

// jest.mock('@/lib/manga', () => ({
//   getManga: jest.fn(),
//   searchMangas: jest.fn(),
// }));

export const mockedGetManga = jest.mocked(getManga);
export const mockedSearchMangas = jest.mocked(searchMangas);

export const testConnectorNameA = 'TestConnectorA' as ConnectorNames;

export const defaultManga: Manga = {
  id: 'manga-id-123',
  sourceName: 'TestConnectorA',
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
};

export function mockGetMangaSuccess(partialManga: Partial<MangaInsert> = {}): Manga {
  const manga: Manga = { ...defaultManga, ...partialManga };
  mockedGetManga.mockResolvedValue(manga);

  return manga;
}
export function mockGetMangaConnectorError(message = 'Invalid connector name'): void {
  mockedGetManga.mockRejectedValue(new Error(message));
}

export function mockSearchMangaSuccess(partialAutocompleteMangas: Partial<MangaAutocomplete>[] = []): MangaAutocomplete[] {
  const autocompleteMangas: MangaAutocomplete[] = partialAutocompleteMangas.map(manga => ({
    connectorName: testConnectorNameA,
    id: defaultManga.sourceId,
    title: defaultManga.title as string,
    chaptersCount: defaultManga.chaptersCount as number,
    ...manga,
  }));
  mockedSearchMangas.mockResolvedValue(autocompleteMangas);

  return autocompleteMangas;
}
export function mockSearchMangaError(message = 'Search error'): void {
  mockedSearchMangas.mockRejectedValue(new Error(message));
}
