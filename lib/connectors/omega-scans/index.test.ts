// import { readFileSync } from 'fs';
// import { join } from 'path';

// import axios from 'axios';

import { OmegaScansConnector } from '.';

// const getMangas = JSON.parse(readFileSync(join(__dirname, 'mocks', 'getMangas.json'), 'utf8'));
// const getManga = JSON.parse(readFileSync(join(__dirname, 'mocks', 'getManga.json'), 'utf8'));

// jest.mock('axios');
// const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('connectors -> omega scans', () => {
  let connector: OmegaScansConnector;

  // beforeAll(() => {
  //   mockedAxios.create.mockReturnThis();
  // });

  beforeEach(() => {
    connector = new OmegaScansConnector();
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
