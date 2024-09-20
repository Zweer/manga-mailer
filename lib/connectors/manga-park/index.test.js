"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const axios_1 = __importDefault(require("axios"));
const _1 = require(".");
const getMangas = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, 'mocks', 'getMangas.json'), 'utf8'));
const getManga = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, 'mocks', 'getManga.json'), 'utf8'));
jest.mock('axios');
const mockedAxios = axios_1.default;
describe('connectors -> manga park', () => {
    let connector;
    beforeAll(() => {
        mockedAxios.create.mockReturnThis();
    });
    beforeEach(() => {
        connector = new _1.MangaParkConnector();
    });
    it('should retrieve the bully comic', async () => {
        mockedAxios.post.mockResolvedValue({ data: getMangas });
        const mangas = await connector.getMangas('illustrator');
        expect(mangas).toHaveLength(10);
    });
    it('should retrieve the bully comic chapters', async () => {
        mockedAxios.post.mockResolvedValue({ data: getManga });
        const manga = await connector.getManga('341963');
        expect(manga).toHaveProperty('chaptersCount', 47);
        expect(manga.chapters).toHaveLength(47);
    });
});
