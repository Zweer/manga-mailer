import { ConnectorNames } from '@zweer/manga-scraper';

export interface Manga {
  site: ConnectorNames;
  id: string;
  title?: string;
  lastReadChapter: number;
  disabled?: boolean;
}
