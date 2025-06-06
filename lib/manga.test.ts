import type { Mock } from 'vitest';

import type { mangaTable } from '@/lib/db/model/manga';

import * as mangaScraper from '@zweer/manga-scraper';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getManga, searchMangas } from '@/lib/manga';

vi.mock('@zweer/manga-scraper', () => ({
  __esModule: true,
  connectors: {
    TestConnectorA: {
      getMangas: vi.fn(),
      getManga: vi.fn(),
      getChapters: vi.fn(),
      getChapter: vi.fn(),
    },
    TestConnectorB: {
      getMangas: vi.fn(),
      getManga: vi.fn(),
      getChapters: vi.fn(),
      getChapter: vi.fn(),
    },
  },
}));

const mockedConnectors = mangaScraper.connectors as unknown as {
  TestConnectorA: { getMangas: Mock; getManga: Mock; getChapters: Mock; getChapter: Mock };
  TestConnectorB: { getMangas: Mock; getManga: Mock; getChapters: Mock; getChapter: Mock };
};

describe('manga Library Functions (lib/manga.ts)', () => {
  beforeEach(() => {
    Object.values(mockedConnectors).forEach((connector) => {
      connector.getMangas.mockReset();
      connector.getManga.mockReset();
      connector.getChapters.mockReset();
      connector.getChapter.mockReset();
    });
  });

  describe('searchMangas', () => {
    it('should call getMangas on all configured connectors and aggregate results', async () => {
      const searchTerm = 'Test Search';
      const mangasA = [{ id: 'a1', title: 'Manga A1 from TestConnectorA', chaptersCount: 10 }];
      const mangasB = [{ id: 'b1', title: 'Manga B1 from TestConnectorB', chaptersCount: 5 }];

      mockedConnectors.TestConnectorA.getMangas.mockResolvedValue(mangasA);
      mockedConnectors.TestConnectorB.getMangas.mockResolvedValue(mangasB);

      const results = await searchMangas(searchTerm);

      expect(mockedConnectors.TestConnectorA.getMangas).toHaveBeenCalledWith(searchTerm);
      expect(mockedConnectors.TestConnectorB.getMangas).toHaveBeenCalledWith(searchTerm);

      expect(results).toEqual(expect.arrayContaining([
        { connectorName: 'TestConnectorA', id: 'a1', title: 'Manga A1 from TestConnectorA', chaptersCount: 10 },
        { connectorName: 'TestConnectorB', id: 'b1', title: 'Manga B1 from TestConnectorB', chaptersCount: 5 },
      ]));
      expect(results.length).toBe(2);
    });

    it('should correctly sort mangas by title, then by chaptersCount', async () => {
      const mangasA = [
        { id: 'a2', title: 'Beta Manga', chaptersCount: 20 },
        { id: 'a1', title: 'Alpha Manga', chaptersCount: 10 },
      ];
      const mangasB = [
        { id: 'b1', title: 'Alpha Manga', chaptersCount: 5 },
      ];

      mockedConnectors.TestConnectorA.getMangas.mockResolvedValue(mangasA);
      mockedConnectors.TestConnectorB.getMangas.mockResolvedValue(mangasB);

      const results = await searchMangas('any');

      expect(results.length).toBe(3);
      expect(results[0]).toEqual({ connectorName: 'TestConnectorB', id: 'b1', title: 'Alpha Manga', chaptersCount: 5 });
      expect(results[1]).toEqual({ connectorName: 'TestConnectorA', id: 'a1', title: 'Alpha Manga', chaptersCount: 10 });
      expect(results[2]).toEqual({ connectorName: 'TestConnectorA', id: 'a2', title: 'Beta Manga', chaptersCount: 20 });
    });

    it('should return an empty array if no mangas are found', async () => {
      mockedConnectors.TestConnectorA.getMangas.mockResolvedValue([]);
      mockedConnectors.TestConnectorB.getMangas.mockResolvedValue([]);

      const results = await searchMangas('nonexistent');
      expect(results).toEqual([]);
    });

    it('should handle errors from one connector gracefully and still return results from others', async () => {
      const mangasB = [{ id: 'b1', title: 'Manga B1', chaptersCount: 5 }];
      mockedConnectors.TestConnectorA.getMangas.mockRejectedValue(new Error('Connector A failed'));
      mockedConnectors.TestConnectorB.getMangas.mockResolvedValue(mangasB);

      const results = await searchMangas('any');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('b1');
    });
  });

  describe('getManga', () => {
    it('should call getManga on the specified connector and return mapped data', async () => {
      const connectorName = 'TestConnectorA';
      const mangaId = 'test-id-a1';
      const rawMangaDataFromScraper = {
        id: mangaId,
        slug: 'test-slug',
        title: 'Detailed Manga Title',
        author: 'Scraper Author',
        artist: 'Scraper Artist',
        excerpt: 'Full excerpt from scraper.',
        image: 'http://scraper.dev/image.png',
        url: 'http://scraper.dev/manga/test-id-a1',
        releasedAt: new Date('2023-01-01T00:00:00.000Z'),
        status: 'Ongoing',
        genres: ['action', 'adventure'],
        score: 9.0,
        chaptersCount: 150,
      };

      mockedConnectors.TestConnectorA.getManga.mockResolvedValue(rawMangaDataFromScraper);

      const result = await getManga(connectorName, mangaId);

      expect(mockedConnectors.TestConnectorA.getManga).toHaveBeenCalledWith(mangaId);
      const expectedResult: typeof mangaTable.$inferInsert = {
        sourceName: connectorName,
        sourceId: mangaId,
        slug: 'test-slug',
        title: 'Detailed Manga Title',
        author: 'Scraper Author',
        artist: 'Scraper Artist',
        excerpt: 'Full excerpt from scraper.',
        image: 'http://scraper.dev/image.png',
        url: 'http://scraper.dev/manga/test-id-a1',
        releasedAt: new Date('2023-01-01T00:00:00.000Z'),
        status: 'Ongoing',
        genres: ['action', 'adventure'],
        score: 9.0,
        chaptersCount: 150,
      };
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if an invalid connector name is provided', async () => {
      const invalidConnectorName = 'NonExistentConnector';
      const mangaId = 'any-id';

      await expect(getManga(invalidConnectorName, mangaId)).rejects.toThrow('Invalid connector name');
    });

    it('should throw an error if the connector fails to get manga details', async () => {
      const connectorName = 'TestConnectorB';
      const mangaId = 'fail-id-b1';
      mockedConnectors.TestConnectorB.getManga.mockRejectedValue(new Error('Scraping failed'));

      await expect(getManga(connectorName, mangaId)).rejects.toThrow('Scraping failed');
    });
  });
});
