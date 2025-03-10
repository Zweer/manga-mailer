import { ConnectorNames } from '../../lib/connectors';

export interface MangaAutocomplete {
  connector: {
    name: ConnectorNames;
    initials: string;
  };
  id: string;
  title: string;
  chaptersCount: number;
}
