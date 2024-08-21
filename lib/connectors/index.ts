import { Connector } from './abstract';
import { MangaParkConnector } from './manga-park';

export type ConnectorNames = 'mangapark';

export const connectors: Record<ConnectorNames, Connector> = {
  mangapark: new MangaParkConnector(),
};
