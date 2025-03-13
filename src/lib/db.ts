import { ConnectorNames } from '../../lib/connectors';
import { Chapter } from '../../lib/interfaces/chapter';
import { Manga, MangaWithoutChapters } from '../../lib/interfaces/manga';

interface MangaSaveLazy<T extends MangaWithoutChapters> {
  connector: ConnectorNames;
  manga: T;
  lastChapter: null;
  readChapters: never[];
  needsLazyLoading: true;
}
export type MangaSaveLazyPartial = MangaSaveLazy<MangaWithoutChapters>;
export type MangaSaveLazyComplete = MangaSaveLazy<Manga>;

interface MangaSaveEager<T extends MangaWithoutChapters> {
  connector: ConnectorNames;
  manga: T;
  lastChapter: Chapter;
  readChapters: number[];
  needsLazyLoading: false;
}
export type MangaSaveEagerPartial = MangaSaveEager<MangaWithoutChapters>;
export type MangaSaveEagerComplete = MangaSaveEager<Manga>;

export type MangaSave = MangaSaveLazyPartial | MangaSaveEagerPartial;
export type MangaSaveComplete = MangaSaveLazyComplete | MangaSaveEagerComplete;

function getFolder(connector?: ConnectorNames): GoogleAppsScript.Drive.Folder {
  const rootFolder = connector ? getFolder() : DriveApp.getRootFolder();
  const folderName = connector ?? 'manga-mailer';
  const folders = rootFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }

  return rootFolder.createFolder(folderName);
}

function getMangaFile(connector?: ConnectorNames, id?: string): GoogleAppsScript.Drive.File {
  console.time('getMangaFile');
  const folder = getFolder(connector);
  console.timeEnd('getMangaFile');

  const filename = `${id ?? 'mangas'}.json`;
  const files = folder.getFilesByName(filename);

  return files.hasNext() ? files.next() : folder.createFile(filename, id ? '{}' : '[]');
}

function getMangaString(): string;
function getMangaString(connector: ConnectorNames, id: string): string;
function getMangaString(connector?: ConnectorNames, id?: string): string {
  console.time('getMangaString');
  const json = getMangaFile(connector, id).getBlob().getDataAsString();
  console.timeEnd('getMangaString');

  return json;
}

export function getUserMangas(): MangaSave[] {
  return JSON.parse(getMangaString()) as MangaSave[];
}

export function getUserManga(connector: ConnectorNames, id: string): MangaSaveComplete {
  return JSON.parse(getMangaString(connector, id)) as MangaSaveComplete;
}

function putUserMangaInMangas(mangaSave: MangaSaveComplete): void {
  const mangas = getUserMangas();

  const found = mangas.find(
    (tmpManga) =>
      tmpManga.manga.id === mangaSave.manga.id && tmpManga.connector === mangaSave.connector,
  );

  if (found) {
    if (mangaSave.needsLazyLoading) {
      found.manga = mangaSave.manga;
    } else {
      const { chapters, ...mangaWithoutChapters } = mangaSave.manga;
      found.manga = mangaWithoutChapters;
      found.lastChapter = chapters.pop()!;
      found.readChapters = mangaSave.readChapters;
      found.needsLazyLoading = mangaSave.needsLazyLoading;
    }
  } else {
    mangas.push(mangaSave);
  }

  mangas.sort((mangaA: MangaSave, mangaB: MangaSave) => {
    if (mangaA.manga.status !== mangaB.manga.status) {
      if (mangaA.manga.status === 'Completed') {
        return 1;
      }
      if (mangaB.manga.status === 'Completed') {
        return -1;
      }
    }
    const unreadChaptersA = mangaA.manga.chaptersCount - mangaA.readChapters.length;
    const unreadChaptersB = mangaB.manga.chaptersCount - mangaB.readChapters.length;
    if (unreadChaptersA !== unreadChaptersB) {
      return unreadChaptersB - unreadChaptersA;
    }

    return mangaA.manga.title.localeCompare(mangaB.manga.title);
  });

  getMangaFile().setContent(JSON.stringify(mangas, null, 2));
}

function putUserMangaInManga(mangaSave: MangaSaveComplete): void {
  getMangaFile(mangaSave.connector, mangaSave.manga.id).setContent(
    JSON.stringify(mangaSave, null, 2),
  );
}

export function putUserManga(mangaSave: MangaSaveComplete): void {
  putUserMangaInMangas(mangaSave);
  putUserMangaInManga(mangaSave);
}
