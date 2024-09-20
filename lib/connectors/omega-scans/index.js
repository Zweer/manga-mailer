"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmegaScansConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const abstract_1 = require("../abstract");
class OmegaScansConnector extends abstract_1.Connector {
    constructor() {
        super();
        this.request = axios_1.default.create({
            baseURL: 'https://api.omegascans.org',
        });
    }
    async getMangas(search) {
        const mangas = [];
        // eslint-disable-next-line no-unmodified-loop-condition
        for (let page = 1, run = true; run; page += 1) {
            const tmpMangas = await this.getMangasFromPage(page, true);
            if (tmpMangas.length > 0) {
                mangas.push(...tmpMangas);
            }
            else {
                run = false;
            }
        }
        return mangas;
    }
    async getManga(id) {
        return {
            id: 'id',
            title: 'title',
            abstract: 'abstract',
            image: 'image',
            url: 'url',
            releasedAt: new Date(),
            isCompleted: true,
            genres: ['genres'],
            score: 0,
            chaptersCount: 0,
            chapters: [],
        };
    }
    async getMangasFromPage(page, adult) {
        const { data } = await this.request.get('/query', {
            params: {
                perPage: 100,
                page,
                adult,
            },
        });
        return data.data.map((manga) => ({
            id: manga.id.toString(),
            title: manga.title,
            abstract: manga.description,
            image: manga.thumbnail,
            url: 'url',
            releasedAt: new Date(manga.created_at),
            isCompleted: manga.status === 'Completed',
            genres: [],
            score: manga.rating ?? 0,
            chaptersCount: parseInt(manga.meta.chapters_count, 10),
        }));
    }
}
exports.OmegaScansConnector = OmegaScansConnector;
