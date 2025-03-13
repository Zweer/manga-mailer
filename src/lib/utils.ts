import { ConnectorNames } from '../../lib/connectors';

export function getParameters(event: any): {
  connector: ConnectorNames;
  mangaId: string;
  chapterIndex: number;
} {
  const connector: ConnectorNames = event.parameters.connector;
  console.log('connector:', connector);

  const mangaId = event.parameters.mangaId;
  console.log('mangaId:', mangaId);

  const chapterIndex = parseInt(event.parameters.chapter ?? '0', 10);
  console.log('chapterIndex:', chapterIndex);

  return { connector, mangaId, chapterIndex };
}
