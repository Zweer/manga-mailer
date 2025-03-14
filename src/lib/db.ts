import { ConnectorNames } from '../../lib/connectors';
import { Chapter } from '../../lib/interfaces/chapter';
import { Manga, MangaWithoutChapters } from '../../lib/interfaces/manga';

interface MangaSaveCommon<T extends MangaWithoutChapters> {
  connector: ConnectorNames;
  manga: T;
  lastChapter: Chapter;
  needsLazyLoading: boolean;
}

export interface MangaSave extends MangaSaveCommon<MangaWithoutChapters> {
  unreadChapters: number;
}

export interface MangaSaveComplete extends MangaSaveCommon<Manga> {
  readChapters: number[];
}

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
      found.lastChapter = mangaSave.lastChapter;
      found.unreadChapters = chapters.filter(
        (chapter) => !mangaSave.readChapters.includes(chapter.index),
      ).length;
      found.needsLazyLoading = mangaSave.needsLazyLoading;
      // @ts-expect-error old stuff
      delete found.readChapters;
    }
  } else {
    const { chapters, ...mangaWithoutChapters } = mangaSave.manga;
    mangas.push({
      connector: mangaSave.connector,
      manga: mangaWithoutChapters,
      lastChapter: mangaSave.lastChapter,
      unreadChapters: chapters.length,
      needsLazyLoading: mangaSave.needsLazyLoading,
    });
  }

  mangas.sort((mangaA: MangaSave, mangaB: MangaSave) => {
    if (mangaA.unreadChapters !== mangaB.unreadChapters) {
      return mangaB.unreadChapters - mangaA.unreadChapters;
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

export function deleteUserManga(connector: ConnectorNames, id: string): void {
  const mangas = getUserMangas();
  const index = mangas.findIndex(
    (tmpManga) => tmpManga.manga.id === id && tmpManga.connector === connector,
  );

  if (index !== -1) {
    mangas.splice(index, 1);
    getMangaFile().setContent(JSON.stringify(mangas, null, 2));
  }

  getMangaFile(connector, id).setTrashed(true);
}

function migrate202503141400populateUnreadChapters() {
  const mangaSaves = getUserMangas();

  mangaSaves
    .filter((mangaSave) => typeof mangaSave.unreadChapters === 'undefined')
    .forEach((mangaSave) => {
      const manga = getUserManga(mangaSave.connector, mangaSave.manga.id);
      putUserManga(manga);
    });
}

function migrate202503141800reorderChapters() {
  const mangaSaves = getUserMangas();

  mangaSaves
    .filter((mangaSave) => mangaSave.lastChapter.index === 1)
    .forEach((mangaSave) => {
      const manga = getUserManga(mangaSave.connector, mangaSave.manga.id);
      manga.manga.chapters.sort((chapterA, chapterB) => chapterA.index - chapterB.index);
      manga.lastChapter = manga.manga.chapters[manga.manga.chapters.length - 1];
      putUserManga(manga);
    });
}

export function migrate() {
  // migrate202503141400populateUnreadChapters()
  // migrate202503141800reorderChapters();
}
