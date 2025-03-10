import { ConnectorNames } from '../../lib/connectors';
import { Manga } from '../../lib/interfaces/manga';

export function getParameters(event: any): {
  connector: ConnectorNames;
  manga: Manga;
  readChapters: number[];
  chapterIndex: number;
} {
  const connector: ConnectorNames = event.parameters.connector;
  console.log('connector:', connector);

  const manga: Manga = JSON.parse(event.parameters.manga);
  console.log('manga:', manga);

  const readChapters: number[] = JSON.parse(event.parameters.readChapters ?? '[]');
  console.log('readChapters:', readChapters);

  const chapterIndex = parseInt(event.parameters.chapter ?? '0', 10);
  console.log('chapterIndex:', chapterIndex);

  return { connector, manga, readChapters, chapterIndex };
}
