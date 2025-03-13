import { ConnectorNames } from '../../lib/connectors';
import { Manga } from '../../lib/interfaces/manga';

export interface MangaSave {
  connector: ConnectorNames;
  manga: Manga;
  readChapters: number[];
  needsLazyLoading: boolean;
}

const USER_PROPERTIES_DRIVE_FILE_ID = 'driveFileId';
const userProperties = PropertiesService.getUserProperties();

const DRIVE_MANGA_FILE = 'manga-mailer.json';

function getFileId(): string {
  let fileId = userProperties.getProperty(USER_PROPERTIES_DRIVE_FILE_ID);
  if (fileId) {
    try {
      DriveApp.getFileById(fileId);
      return fileId;
    } catch (error) {
      fileId = null;
    }
  }

  const files = DriveApp.getFilesByName(DRIVE_MANGA_FILE);
  const file = files.hasNext()
    ? files.next()
    : DriveApp.createFile(DRIVE_MANGA_FILE, '[]', 'application/json');
  fileId = file.getId();
  userProperties.setProperty(USER_PROPERTIES_DRIVE_FILE_ID, fileId);

  return fileId;
}

function getFile(): GoogleAppsScript.Drive.File {
  return DriveApp.getFileById(getFileId());
}

export function getUserMangas(): MangaSave[] {
  const mangasString = getFile().getBlob().getDataAsString();
  const mangas: MangaSave[] = JSON.parse(mangasString);

  return mangas;
}

export function getUserManga(mangaId: string, connector: ConnectorNames): MangaSave {
  const mangas = getUserMangas();

  return mangas.find((manga) => manga.manga.id === mangaId && manga.connector === connector)!;
}

export function putUserManga(mangaSave: MangaSave): void {
  const mangas = getUserMangas();

  const found = mangas.find(
    (tmpManga) =>
      tmpManga.manga.id === mangaSave.manga.id && tmpManga.connector === mangaSave.connector,
  );

  if (found) {
    found.manga = mangaSave.manga;
    found.readChapters = mangaSave.readChapters;
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

  getFile().setContent(JSON.stringify(mangas, null, 2));
}
