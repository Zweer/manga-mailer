import { readFileSync } from 'fs';

import axios from 'axios';

import { MangaParkConnector } from '.';

const getMangas = JSON.parse(readFileSync('./mocks/getMangas.json', 'utf8'));
const getManga = JSON.parse(readFileSync('./mocks/getManga.json', 'utf8'));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('connectors -> manga park', () => {
  let connector: MangaParkConnector;

  beforeAll(() => {
    mockedAxios.create.mockReturnThis();
  });

  beforeEach(() => {
    connector = new MangaParkConnector();
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
