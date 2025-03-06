import { Manga } from '../interfaces/manga';

import { MangaParkGetManga, MangaParkGetMangas } from './manga-park';
import { OmegaScansGetManga, OmegaScansGetMangas } from './omega-scans';

export type ConnectorNames = 'mangapark' | 'omegascans';

export type GetMangas = (search?: string) => Omit<Manga, 'chapters'>[];
export type GetManga = (id: string) => Manga;

const mangapark = {
  getMangas: MangaParkGetMangas,
  getManga: MangaParkGetManga,
};

const omegascans = {
  getMangas: OmegaScansGetMangas,
  getManga: OmegaScansGetManga,
};

export const connectors: Record<ConnectorNames, { getMangas: GetMangas; getManga: GetManga }> = {
  mangapark,
  omegascans,
};
