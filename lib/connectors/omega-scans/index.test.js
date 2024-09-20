"use strict";
// import { readFileSync } from 'fs';
// import { join } from 'path';
Object.defineProperty(exports, "__esModule", { value: true });
// import axios from 'axios';
const _1 = require(".");
// const getMangas = JSON.parse(readFileSync(join(__dirname, 'mocks', 'getMangas.json'), 'utf8'));
// const getManga = JSON.parse(readFileSync(join(__dirname, 'mocks', 'getManga.json'), 'utf8'));
// jest.mock('axios');
// const mockedAxios = axios as jest.Mocked<typeof axios>;
describe('connectors -> omega scans', () => {
    let connector;
    // beforeAll(() => {
    //   mockedAxios.create.mockReturnThis();
    // });
    beforeEach(() => {
        connector = new _1.OmegaScansConnector();
    });
    it('should retrieve the bully comic', async () => {
        // mockedAxios.post.mockResolvedValue({ data: getMangas });
        const mangas = await connector.getMangas('bully');
        expect(mangas).toHaveLength(164);
    });
    it('should retrieve the bully comic chapters', async () => {
        // mockedAxios.post.mockResolvedValue({ data: getManga });
        const manga = await connector.getManga('341963');
        expect(manga).toHaveProperty('chaptersCount', 47);
        expect(manga.chapters).toHaveLength(47);
    });
});
