import { Connector } from '..';
import { Manga, MangaWithoutChapters, Status } from '../../interfaces/manga';

import { MangaParkGetMangaResponse } from './interfaces/getManga';
import { MangaParkGetMangasResponse } from './interfaces/getMangas';

export class MangaParkConnector implements Connector {
  BASE_URL = 'https://mangapark.net';
  BASE_PATH = `${this.BASE_URL}/apo/`;
  HEADERS = {
    'x-origin': this.BASE_URL,
    'x-referer': `${this.BASE_URL}/`,
    'accept-language': 'en-US,en;q=0.9',
    cookie: 'nsfw=2;',
    'content-type': 'application/json',
  };

  GRAPHQL_QUERY = `
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

  name = 'mangapark' as const;
  initials = 'MP';
  needsLazyLoading = false;

  getMangas(search?: string): MangaWithoutChapters[] {
    const mangas: Omit<Manga, 'chapters'>[] = [];
    const operationName = 'getMangas';
    const query = this.GRAPHQL_QUERY;
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

      const response = UrlFetchApp.fetch(this.BASE_PATH, {
        method: 'post',
        payload: JSON.stringify({ operationName, query, variables }),
        headers: this.HEADERS,
      });
      const data: MangaParkGetMangasResponse = JSON.parse(response.getContentText());

      mangas.push(
        ...data.data.get_searchComic.items.map((manga) => ({
          id: manga.data.id,
          slug: manga.data.slug!,
          title: manga.data.name!,
          excerpt: manga.data.summary,
          image: manga.data.urlCoverOri,
          url: `${this.BASE_URL}${manga.data.urlPath}`,
          releasedAt: manga.data.dateCreate
            ? new Date(manga.data.dateCreate).toISOString()
            : undefined,
          status: this.matchStatus(manga.data.originalStatus),
          genres: manga.data.genres ?? [],
          score: manga.data.score_avg,
          chaptersCount: manga.data.chaps_normal ?? 0,
        })),
      );

      run = page < data.data.get_searchComic.paging.pages;
    }

    return mangas;
  }

  getManga(id: string): Manga {
    const operationName = 'getManga';
    const query = this.GRAPHQL_QUERY;
    const variables = {
      getComicNodeId: id,
      comicId: id,
    };

    const response = UrlFetchApp.fetch(this.BASE_PATH, {
      method: 'post',
      payload: JSON.stringify({ operationName, query, variables }),
      headers: this.HEADERS,
    });
    const data: MangaParkGetMangaResponse = JSON.parse(response.getContentText());

    if (!data.data.get_comicNode.data) {
      throw new Error('Comic not found');
    }

    return {
      id: data.data.get_comicNode.data.id,
      title: data.data.get_comicNode.data.name!,
      slug: data.data.get_comicNode.data.slug!,
      excerpt: data.data.get_comicNode.data.summary,
      image: data.data.get_comicNode.data.urlCoverOri,
      url: `${this.BASE_URL}${data.data.get_comicNode.data.urlPath}`,
      releasedAt: data.data.get_comicNode.data.dateCreate
        ? new Date(data.data.get_comicNode.data.dateCreate).toISOString()
        : undefined,
      status: this.matchStatus(data.data.get_comicNode.data.originalStatus),
      genres: data.data.get_comicNode.data.genres ?? [],
      score: data.data.get_comicNode.data.score_avg,
      chaptersCount: data.data.get_comicNode.data.chaps_normal ?? 0,
      chapters: data.data.get_comicChapterList
        .map((chapter) => ({
          id: chapter.data.dname!,
          slug: chapter.data.urlPath!.split('/').pop()!,
          title: chapter.data.title,
          index: chapter.data.serial!,
          url: `${this.BASE_URL}${chapter.data.urlPath}`,
          releasedAt: chapter.data.dateCreate
            ? new Date(chapter.data.dateCreate).toISOString()
            : undefined,
          images: chapter.data.imageFile?.urlList ?? [],
        }))
        .sort((chapterA, chapterB) => chapterA.index - chapterB.index),
    };
  }

  lazyLoadManga(manga: Manga): Manga {
    // no need to lazy load
    return manga;
  }

  protected matchStatus(
    status: MangaParkGetMangaResponse['data']['get_comicNode']['data']['originalStatus'],
  ): Status {
    switch (status) {
      case 'ongoing':
        return Status.Ongoing;

      case 'completed':
        return Status.Completed;

      case 'hiatus':
        return Status.Hiatus;

      case null:
        return Status.Unknown;

      default:
        throw new Error(`Unknown status: ${status}`);
    }
  }
}
