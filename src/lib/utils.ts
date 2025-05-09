import { ConnectorNames } from '../../lib/connectors';
import { Chapter } from '../../lib/interfaces/chapter';
import { MangaSave } from './db';

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

function lambdaLazyChaptersRemaining(chapter: Chapter): boolean {
  return chapter.images.length === 0;
}

export function calculateLazyChaptersRemaining(chapters: Chapter[]): number {
  return chapters.filter(lambdaLazyChaptersRemaining).length;
}

export function calculateLazyChaptersRemainingStart(chapters: Chapter[]): number {
  return chapters.findIndex(lambdaLazyChaptersRemaining);
}

export function calculateLastChapter(chapters: Chapter[]): Chapter {
  return chapters[chapters.length - 1];
}

export function calculateLazyLoadMangas(mangas: MangaSave[]): MangaSave[] {
  return mangas.filter(({ needsLazyLoading }) => needsLazyLoading);
}

export function calculateLazyLoadMangas(mangas: MangaSave[]): MangaSave[] {
  return mangas.filter(({ needsLazyLoading }) => needsLazyLoading);
}

export function calculateLazyLoadMangas(mangas: MangaSave[]): MangaSave[] {
  return mangas.filter(({ needsLazyLoading }) => needsLazyLoading);
}
