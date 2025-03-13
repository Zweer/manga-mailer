import { Connector } from '..';
import { Chapter } from '../../interfaces/chapter';
import { Manga, MangaWithoutChapters, Status } from '../../interfaces/manga';

import { OmegaScansGetChapterDetailsResponse } from './interfaces/getChapterDetails';
import { OmegaScansGetChaptersResponse } from './interfaces/getChapters';
import { OmegaScansGetMangaResponse } from './interfaces/getManga';
import { OmegaScansGetMangasResponse } from './interfaces/getMangas';

export class OmegaScansConnector implements Connector {
  BASE_URL = 'https://omegascans.org';
  API_URL = 'https://api.omegascans.org';
  HEADERS = {
    'content-type': 'application/json',
  };

  name = 'omegascans' as const;
  initials = 'OS';
  needsLazyLoading = false;

  getMangas(search?: string): MangaWithoutChapters[] {
    const mangas: MangaWithoutChapters[] = [];

    for (let page = 1, run = true; run; page += 1) {
      const tmpMangas = this.getMangasFromPage(search, page, true);
      if (tmpMangas.length > 0) {
        mangas.push(...tmpMangas);
      } else {
        run = false;
      }
    }

    return mangas;
  }

  getManga(id: string): Manga {
    const chapters: Chapter[] = [];
    let mangaSlug = '';

    for (let page = 1, run = true; run; page += 1) {
      const { chapters: tmpChapters, mangaSlug: tmpMangaSlug } = this.getChaptersFromPage(id, page);

      if (!mangaSlug) {
        mangaSlug = tmpMangaSlug;
      }

      if (tmpChapters.length > 0) {
        chapters.push(...tmpChapters);
      } else {
        run = false;
      }
    }

    const url = `${this.API_URL}/series/${mangaSlug}`;
    const response = UrlFetchApp.fetch(url, { headers: this.HEADERS });
    const data: OmegaScansGetMangaResponse = JSON.parse(response.getContentText());

    return {
      id: data.id.toString(),
      slug: data.series_slug,
      title: data.title,
      excerpt: data.description,
      image: data.thumbnail,
      url: `${this.BASE_URL}/series/${data.series_slug}`,
      releasedAt: new Date(data.seasons[0].created_at).toISOString(),
      status: this.matchStatus(data.status),
      genres: [],
      score: data.rating ?? 0,
      chaptersCount: chapters.length,
      chapters: chapters.sort((chapterA, chapterB) => chapterA.index - chapterB.index),
    };
  }

  lazyLoadManga(manga: Manga, offset = 0, limit = 20): Manga {
    manga.chapters.slice(offset, offset + limit).forEach((chapter) => {
      const response = UrlFetchApp.fetch(`${this.API_URL}/chapter/${manga.slug}/${chapter.slug}`, {
        headers: this.HEADERS,
      });
      const data: OmegaScansGetChapterDetailsResponse = JSON.parse(response.getContentText());

      chapter.images = data.chapter.chapter_data.images;
    });

    return manga;
  }

  protected getMangasFromPage(
    search: string | undefined,
    page: number,
    adult: boolean,
  ): Omit<Manga, 'chapters'>[] {
    const url = `${this.API_URL}/query?perPage=100&page=${page}&adult=${adult}&query_string=${search}`;
    const response = UrlFetchApp.fetch(url, { headers: this.HEADERS });
    const data: OmegaScansGetMangasResponse = JSON.parse(response.getContentText());

    return data.data.map((manga) => ({
      id: manga.id.toString(),
      slug: manga.series_slug,
      title: manga.title,
      excerpt: manga.description,
      image: manga.thumbnail,
      url: `${this.BASE_URL}/series/${manga.series_slug}`,
      releasedAt: new Date(manga.created_at).toISOString(),
      status: this.matchStatus(manga.status),
      genres: [],
      score: manga.rating ?? 0,
      chaptersCount: manga.free_chapters.length,
    }));
  }

  protected getChaptersFromPage(
    id: string,
    page: number,
  ): { chapters: Chapter[]; mangaSlug: string } {
    const url = `${this.API_URL}/chapter/query?perPage=100&page=${page}&series_id=${id}`;
    const response = UrlFetchApp.fetch(url, { headers: this.HEADERS });
    const data: OmegaScansGetChaptersResponse = JSON.parse(response.getContentText());

    let mangaSlug = '';
    const chapters = data.data
      .filter((chapter) => chapter.price === 0)
      .map((chapter) => {
        if (!mangaSlug) {
          mangaSlug = chapter.series.series_slug;
        }

        return {
          id: chapter.chapter_name,
          slug: chapter.chapter_slug,
          title: chapter.chapter_title ?? '',
          index: 0,
          url: `${this.BASE_URL}/series/${chapter.series.series_slug}/${chapter.chapter_slug}`,
          images: [],
        };
      });

    return {
      chapters,
      mangaSlug,
    };
  }

  protected matchStatus(status: OmegaScansGetMangasResponse['data'][number]['status']): Status {
    switch (status) {
      case 'Ongoing':
        return Status.Ongoing;

      case 'Completed':
        return Status.Completed;

      case 'Hiatus':
        return Status.Hiatus;

      case 'Dropped':
        return Status.Cancelled;

      default:
        throw new Error(`Unknown status: ${status}`);
    }
  }
}
