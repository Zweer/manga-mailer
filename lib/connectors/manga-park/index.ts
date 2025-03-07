import { GetManga, GetMangas } from '..';
import { Manga, Status } from '../../interfaces/manga';

import { MangaParkGetMangaResponse } from './interfaces/getManga';
import { MangaParkGetMangasResponse } from './interfaces/getMangas';

const graphqlQuery = `
query getMangas($select: SearchComic_Select) {
  get_searchComic(select: $select) {
    paging {
      page
      pages
    }
    items {
      ...mangaData
    }
  }
}

query getManga($comicId: ID!) {
  get_comicNode(id: $comicId) {
    ...mangaData
  }
  get_comicChapterList(comicId: $comicId) {
    data {
      dateCreate
      dname
      imageFile {
        urlList
      }
      serial
      sfw_result
      title
      urlPath
    }
  }
}

fragment mangaData on ComicNode {
  data {
    artists
    authors
    chaps_normal
    chaps_others
    dateCreate
    extraInfo
    genres
    id
    name
    originalStatus
    score_avg
    sfw_result
    slug
    summary
    urlCover300
    urlCover600
    urlCover900
    urlCoverOri
    urlPath
  }
}
`;

const baseUrl = 'https://mangapark.net';
const basePath = `${baseUrl}/apo/`;

const headers = {
  'x-origin': baseUrl,
  'x-referer': `${baseUrl}/`,
  cookie: 'nsfw=2;',
  'content-type': 'application/json',
};

export const MangaParkGetMangas: GetMangas = (search?: string) => {
  const mangas: Omit<Manga, 'chapters'>[] = [];
  const operationName = 'getMangas';
  const query = graphqlQuery;
  const variables = {
    select: {
      page: 1,
      size: 1000,
      word: search,
      sortby: 'field_score',
    },
  };

  for (let page = 1, run = true; run; page += 1) {
    variables.select.page = page;

    const response = UrlFetchApp.fetch(basePath, {
      method: 'post',
      payload: JSON.stringify({ operationName, query, variables }),
      headers,
    });
    const data: MangaParkGetMangasResponse = JSON.parse(response.getContentText());

    mangas.push(
      ...data.data.get_searchComic.items.map((manga) => ({
        id: manga.data.id,
        title: manga.data.name!,
        excerpt: manga.data.summary,
        image: manga.data.urlCoverOri,
        url: `${baseUrl}${manga.data.urlPath}`,
        releasedAt: manga.data.dateCreate ? new Date(manga.data.dateCreate) : undefined,
        status: matchStatus(manga.data.originalStatus),
        genres: manga.data.genres ?? [],
        score: manga.data.score_avg,
        chaptersCount: (manga.data.chaps_normal ?? 0) + (manga.data.chaps_others ?? 0),
      })),
    );

    run = page < data.data.get_searchComic.paging.pages;
  }

  return mangas;
};

export const MangaParkGetManga: GetManga = (id: string) => {
  const operationName = 'getManga';
  const query = graphqlQuery;
  const variables = {
    getComicNodeId: id,
    comicId: id,
  };

  const response = UrlFetchApp.fetch(basePath, {
    method: 'post',
    payload: JSON.stringify({ operationName, query, variables }),
    headers,
  });
  const data: MangaParkGetMangaResponse = JSON.parse(response.getContentText());

  if (!data.data.get_comicNode.data) {
    throw new Error('Comic not found');
  }

  return {
    id: data.data.get_comicNode.data.id,
    title: data.data.get_comicNode.data.name!,
    excerpt: data.data.get_comicNode.data.summary,
    image: data.data.get_comicNode.data.urlCoverOri,
    url: `${baseUrl}${data.data.get_comicNode.data.urlPath}`,
    releasedAt: data.data.get_comicNode.data.dateCreate
      ? new Date(data.data.get_comicNode.data.dateCreate)
      : undefined,
    status: matchStatus(data.data.get_comicNode.data.originalStatus),
    genres: data.data.get_comicNode.data.genres ?? [],
    score: data.data.get_comicNode.data.score_avg,
    chaptersCount:
      (data.data.get_comicNode.data.chaps_normal ?? 0) +
      (data.data.get_comicNode.data.chaps_others ?? 0),
    chapters: data.data.get_comicChapterList.map((chapter) => ({
      id: chapter.data.dname!,
      title: chapter.data.title ?? chapter.data.dname!,
      index: chapter.data.serial!,
      url: chapter.data.urlPath!,
      releasedAt: chapter.data.dateCreate ? new Date(chapter.data.dateCreate) : undefined,
      images: chapter.data.imageFile?.urlList ?? [],
    })),
  };
};

// eslint-disable-next-line no-inner-declarations
function matchStatus(
  status: MangaParkGetMangaResponse['data']['get_comicNode']['data']['originalStatus'],
): Status {
  switch (status) {
    case 'ongoing':
      return Status.Ongoing;

    case 'completed':
      return Status.Completed;

    case null:
      return Status.Unknown;

    default:
      throw new Error(`Unknown status: ${status}`);
  }
}
