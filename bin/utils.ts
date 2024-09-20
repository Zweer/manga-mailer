import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { Manga } from '../data/manga.interface';

const mangasPath = join(__dirname, '..', 'data', 'mangas.json');

interface ReadMangas {
  mangas: Manga[];
}

export function getReadMangas(): ReadMangas {
  const readMangasStr = readFileSync(mangasPath, 'utf8');

  return JSON.parse(readMangasStr) as { mangas: Manga[] };
}

export function putReadMangas(readMangas: ReadMangas): void {
  writeFileSync(mangasPath, JSON.stringify(readMangas, null, 2));
}
