import { ConnectorNames } from '../lib/connectors';

export interface Manga {
  site: ConnectorNames;
  id: string;
  title?: string;
  lastReadChapter: number;
  disabled?: boolean;
}
