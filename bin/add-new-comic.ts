import { getInput, setFailed, setOutput } from '@actions/core';

import { ConnectorNames, connectors } from '../lib/connectors';

import { getReadMangas, putReadMangas } from './utils';

function validateSource(comicSource: string) {
  return Object.keys(connectors).includes(comicSource);
}

async function main(): Promise<void> {
  const comicId = getInput('comic_id', { required: true });
  const comicSource = getInput('comic_source', { required: true }) as ConnectorNames;
  const comicChapter = parseInt(getInput('comic_chapter'), 10);

  const readMangas = getReadMangas();

  if (!validateSource(comicSource)) {
    throw new Error(`Invalid comic source provided: ${comicSource}`);
  }

  const connector = connectors[comicSource];
  const manga = await connector.getManga(comicId);

  if (readMangas.mangas.some((manga) => manga.id === comicId && manga.site === comicSource)) {
    throw new Error('Comic is alread tracked');
  }

  readMangas.mangas.push({
    site: comicSource,
    id: comicId,
    title: manga.title,
    lastReadChapter: comicChapter,
  });

  setOutput('comic_name', manga.title);

  readMangas.mangas.sort((mangaA, mangaB) => {
    if (mangaA.site !== mangaB.site) {
      return (mangaA.site as string).localeCompare(mangaB.site);
    }

    if (mangaA.site === 'mangapark') {
      return parseInt(mangaA.id, 10) - parseInt(mangaB.id, 10);
    }

    return mangaA.id.localeCompare(mangaB.id);
  });

  putReadMangas(readMangas);
}

main().catch((error) => {
  setFailed(`Action failed with error ${error}`);
});
