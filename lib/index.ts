import { Connector } from './connector';
import { MangaParkConnector } from './manga-park';
import { OmegaScansConnector } from './omega-scans';

export type ConnectorNames = 'mangapark' | 'omegascans';

export const connectors: Record<ConnectorNames, Connector> = {
  mangapark: new MangaParkConnector(),
  omegascans: new OmegaScansConnector(),
};
