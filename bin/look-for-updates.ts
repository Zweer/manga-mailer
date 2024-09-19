import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { Manga } from '../data/manga.interface';
import { connectors } from '../lib/connectors';
import { notify } from '../lib/notifier';
import { Chapter } from '../model/chapter';
import { MangaWithChapters } from '../model/mangaWithChapters';

const mangasPath = join(__dirname, '..', 'data', 'mangas.json');
const readMangas = JSON.parse(readFileSync(mangasPath, 'utf8')) as { mangas: Manga[] };

const dry = process.argv.some((arg) => arg === '--dry');

async function checkManga(readManga: Manga): Promise<number> {
  if (readManga.disabled) {
    return 0;
  }

  const connector = connectors[readManga.site];
  const manga = await connector.getManga(readManga.id);

  const newChapters = manga.chapters
    .filter((chapter) => chapter.index > readManga.lastReadChapter)
    .sort((chapterA, chapterB) => chapterA.index - chapterB.index);

  if (newChapters.length > 0) {
    await notifyUser(manga, newChapters);
    // eslint-disable-next-line require-atomic-updates
    readManga.lastReadChapter = newChapters[newChapters.length - 1].index;
  }

  return newChapters.length;
}

async function notifyUser(manga: MangaWithChapters, newChapters: Chapter[]): Promise<void> {
  console.log(
    'Unread chapters found!',
    manga.title,
    newChapters.map((chapter) => chapter.index),
  );

  await newChapters.reduce(async (promise, newChapter) => {
    await promise;
    await notifyChapter(manga, newChapter);
  }, Promise.resolve());
}

async function notifyChapter(manga: MangaWithChapters, chapter: Chapter): Promise<void> {
  let subject = `${manga.title} - ${chapter.index}`;
  if (chapter.title) {
    subject = `${subject} - ${chapter.title}`;
  }

  const text = chapter.url;
  const htmlChapter = chapter.images.map((image) => `<img src="${image}" />`).join('<br />\n');
  const html = `${htmlChapter}<br /><br />\n${subject}`;

  if (!dry) {
    const notification = await notify(subject, text, html);

    console.log(`${notification.sent ? 'OK' : 'KO'} - ${manga.title} - ${chapter.index}`);
  }
}

async function main(): Promise<void> {
  if (dry) {
    console.log('!!! Dry run !!!');
  }

  const unread = await readMangas.mangas.reduce(async (promise, readManga) => {
    const sum = await promise;
    const unread = await checkManga(readManga);

    return sum + unread;
  }, Promise.resolve(0));

  console.log('Unread manga chapters found:', unread);

  if (!dry) {
    writeFileSync(mangasPath, JSON.stringify(readMangas, null, 2));
  }
}

main().catch((error) => console.error(error));
