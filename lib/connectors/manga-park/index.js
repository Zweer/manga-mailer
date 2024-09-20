"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaParkConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const abstract_1 = require("../abstract");
const mangaDataGraphql = `
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
`;
const getMangasGraphql = `
query getMangas($select: SearchComic_Select) {
  get_searchComic(select: $select) {
    paging {
      page
      pages
    }
    items { ${mangaDataGraphql} }
  }
}
`;
const getMangaGraphql = `
query getManga($comicId: ID!) {
  get_comicNode(id: $comicId) { ${mangaDataGraphql} }
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
`;
class MangaParkConnector extends abstract_1.Connector {
    static BASE_URL = 'https://mangapark.net';
    constructor() {
        super();
        this.request = axios_1.default.create({
            baseURL: `${MangaParkConnector.BASE_URL}/apo`,
            headers: {
                'x-origin': MangaParkConnector.BASE_URL,
                'x-referer': `${MangaParkConnector.BASE_URL}/`,
                cookie: 'nsfw=2;',
            },
        });
    }
    async getMangas(search) {
        const mangas = [];
        const operationName = 'getMangas';
        const query = getMangasGraphql;
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
            const { data } = await this.request.post('/', {
                operationName,
                query,
                variables,
            });
            mangas.push(...data.data.get_searchComic.items.map((manga) => ({
                id: manga.data.id,
                title: manga.data.name,
                abstract: manga.data.summary,
                image: manga.data.urlCoverOri,
                url: `${MangaParkConnector.BASE_URL}${manga.data.urlPath}`,
                releasedAt: manga.data.dateCreate ? new Date(manga.data.dateCreate) : undefined,
                isCompleted: manga.data.originalStatus === 'completed',
                genres: manga.data.genres ?? [],
                score: manga.data.score_avg,
                chaptersCount: (manga.data.chaps_normal ?? 0) + (manga.data.chaps_others ?? 0),
            })));
            run = page < data.data.get_searchComic.paging.pages;
        }
        return mangas;
    }
    async getManga(id) {
        const operationName = 'getManga';
        const query = getMangaGraphql;
        const variables = {
            getComicNodeId: id,
            comicId: id,
        };
        const { data } = await this.request.post('/', {
            operationName,
            query,
            variables,
        });
        if (!data.data.get_comicNode.data) {
            throw new Error('Comic not found');
        }
        const manga = {
            id: data.data.get_comicNode.data.id,
            title: data.data.get_comicNode.data.name,
            abstract: data.data.get_comicNode.data.summary,
            image: data.data.get_comicNode.data.urlCoverOri,
            url: `${MangaParkConnector.BASE_URL}${data.data.get_comicNode.data.urlPath}`,
            isCompleted: data.data.get_comicNode.data.originalStatus === 'completed',
            genres: data.data.get_comicNode.data.genres ?? [],
            score: data.data.get_comicNode.data.score_avg,
            chaptersCount: (data.data.get_comicNode.data.chaps_normal ?? 0) +
                (data.data.get_comicNode.data.chaps_others ?? 0),
            chapters: data.data.get_comicChapterList.map((chapter) => ({
                title: chapter.data.title,
                index: chapter.data.serial,
                url: chapter.data.urlPath,
                releasedAt: chapter.data.dateCreate ? new Date(chapter.data.dateCreate) : undefined,
                images: chapter.data.imageFile?.urlList ?? [],
            })),
        };
        return manga;
    }
}
exports.MangaParkConnector = MangaParkConnector;
