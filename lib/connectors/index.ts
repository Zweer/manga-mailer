import { Manga } from '../interfaces/manga';

import { MangaParkGetManga, MangaParkGetMangas } from './manga-park';
import { OmegaScansGetManga, OmegaScansGetMangas } from './omega-scans';

export type ConnectorNames = 'mangapark' | 'omegascans';

export type GetMangas = (search?: string) => Omit<Manga, 'chapters'>[];
export type GetManga = (id: string) => Manga;

interface Connector {
  name: ConnectorNames;
  initials: string;
  getMangas: GetMangas;
  getManga: GetManga;
}

const mangapark: Connector = {
  name: 'mangapark',
  initials: 'MP',
  getMangas: MangaParkGetMangas,
  getManga: MangaParkGetManga,
};

const omegascans: Connector = {
  name: 'omegascans',
  initials: 'OS',
  getMangas: OmegaScansGetMangas,
  getManga: OmegaScansGetManga,
};

export const connectors: Connector[] = [mangapark, omegascans];
