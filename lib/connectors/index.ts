import { Manga, MangaWithoutChapters } from '../interfaces/manga';

import { MangaParkConnector } from './manga-park';
import { OmegaScansConnector } from './omega-scans';

export type ConnectorNames = 'mangapark' | 'omegascans';

export interface Connector {
  name: ConnectorNames;
  initials: string;
  needsLazyLoading: boolean;

  getMangas(search?: string): MangaWithoutChapters[];
  getManga(id: string): Manga;
  lazyLoadManga(manga: Manga, offset: number, limit?: number): Manga;
}

export const connectors: Connector[] = [new MangaParkConnector(), new OmegaScansConnector()];
