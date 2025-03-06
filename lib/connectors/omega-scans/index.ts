import { GetManga, GetMangas } from '..';
import { Chapter } from '../../interfaces/chapter';
import { Manga, Status } from '../../interfaces/manga';

import { OmegaScansGetChapterDetailsResponse } from './interfaces/getChapterDetails';
import { OmegaScansGetChaptersResponse } from './interfaces/getChapters';
import { OmegaScansGetMangaResponse } from './interfaces/getManga';
import { OmegaScansGetMangasResponse } from './interfaces/getMangas';

const baseUrl = 'https://omegascans.org';
const apiUrl = 'https://api.omegascans.org';

export const OmegaScansGetMangas: GetMangas = (search?: string) => {
  const mangas: Omit<Manga, 'chapters'>[] = [];

  for (let page = 1, run = true; run; page += 1) {
    const tmpMangas = OmegaScansGetMangasFromPage(search, page, true);
    if (tmpMangas.length > 0) {
      mangas.push(...tmpMangas);
    } else {
      run = false;
    }
  }

  return mangas;
};

export const OmegaScansGetManga: GetManga = (id: string) => {
  const chapters: Chapter[] = [];
  let mangaSlug = '';

  for (let page = 1, run = true; run; page += 1) {
    const { chapters: tmpChapters, mangaSlug: tmpMangaSlug } = OmegaScansGetChaptersFromPage(
      id,
      page,
    );

    if (!mangaSlug) {
      mangaSlug = tmpMangaSlug;
    }

    if (tmpChapters.length > 0) {
      chapters.push(...tmpChapters);
    } else {
      run = false;
    }
  }

  const response = UrlFetchApp.fetch(`${apiUrl}/series/${id}`);
  const data: OmegaScansGetMangaResponse = JSON.parse(response.getContentText());

  return {
    id: data.id.toString(),
    title: data.title,
    excerpt: data.description,
    image: data.thumbnail,
    url: `${baseUrl}/series/${data.series_slug}`,
    releasedAt: new Date(data.seasons[0].created_at),
    status: OmegaScansMatchStatus(data.status),
    genres: [],
    score: data.rating ?? 0,
    chaptersCount: chapters.length,
    chapters,
  };
};

function OmegaScansGetMangasFromPage(
  search: string | undefined,
  page: number,
  adult: boolean,
): Omit<Manga, 'chapters'>[] {
  const response = UrlFetchApp.fetch(
    `${apiUrl}/query?perPage=100&page=${page}&adult=${adult}&query_string=${search}`,
  );
  const data: OmegaScansGetMangasResponse = JSON.parse(response.getContentText());

  return data.data.map((manga) => ({
    id: manga.id.toString(),
    title: manga.title,
    excerpt: manga.description,
    image: manga.thumbnail,
    url: `${baseUrl}/series/${manga.series_slug}`,
    releasedAt: new Date(manga.created_at),
    status: OmegaScansMatchStatus(manga.status),
    genres: [],
    score: manga.rating ?? 0,
    chaptersCount: manga.free_chapters.length,
  }));
}

function OmegaScansGetChaptersFromPage(
  id: string,
  page: number,
): { chapters: Chapter[]; mangaSlug: string } {
  const response = UrlFetchApp.fetch(
    `${apiUrl}/chapter/query?perPage=100&page=${page}&series_id=${id}`,
  );
  const data: OmegaScansGetChaptersResponse = JSON.parse(response.getContentText());

  let mangaSlug = '';
  const chapters = data.data.reduce((chapters, chapter) => {
    const response = UrlFetchApp.fetch(
      `${apiUrl}/chapter/${chapter.series.series_slug}/${chapter.chapter_slug}`,
    );
    const data: OmegaScansGetChapterDetailsResponse = JSON.parse(response.getContentText());

    if (!mangaSlug) {
      mangaSlug = chapter.series.series_slug;
    }

    if (data.chapter.price) {
      return chapters;
    }

    chapters.push({
      id: chapter.id.toString(),
      title: chapter.chapter_name,
      index: parseFloat(data.chapter.index),
      url: `${apiUrl}/series/${chapter.series.series_slug}/${chapter.chapter_slug}`,
      images: data.chapter.chapter_data.images,
    });

    return chapters;
  }, [] as Chapter[]);

  return {
    chapters,
    mangaSlug,
  };
}

function OmegaScansMatchStatus(
  status: OmegaScansGetMangasResponse['data'][number]['status'],
): Status {
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

// function OmegaScansExtractIndex(chapter: GetChapters['data'][number]): number {
//   const match = /chapter-(.*)/.exec(chapter.chapter_slug);
//   if (match) {
//     return parseFloat(match[1].replace('-', '.'));
//   }

//   throw new Error(`Invalid index extraction: ${chapter.chapter_slug}`);
// }
