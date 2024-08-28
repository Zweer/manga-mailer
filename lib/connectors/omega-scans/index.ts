import axios from 'axios';

import { Connector } from '../abstract';
import { Manga } from '../../../model/manga';
import { MangaWithChapters } from '../../../model/mangaWithChapters';

import { OmegaScansGetMangas } from './interfaces/getMangas';

export class OmegaScansConnector extends Connector {
  constructor() {
    super();

    this.request = axios.create({
      baseURL: 'https://api.omegascans.org',
    });
  }

  async getMangas(search?: string): Promise<Manga[]> {
    const mangas: Manga[] = [];

    // eslint-disable-next-line no-unmodified-loop-condition
    for (let page = 1, run = true; run; page += 1) {
      const tmpMangas = await this.getMangasFromPage(page, true);
      if (tmpMangas.length > 0) {
        mangas.push(...tmpMangas);
      } else {
        run = false;
      }
    }

    return mangas;
  }

  async getManga(id: string): Promise<MangaWithChapters> {
    return {
      id: 'id',
      title: 'title',
      abstract: 'abstract',
      image: 'image',
      url: 'url',
      releasedAt: new Date(),
      isCompleted: true,
      genres: ['genres'],
      score: 0,
      chaptersCount: 0,
      chapters: [],
    };
  }

  protected async getMangasFromPage(page: number, adult: boolean): Promise<Manga[]> {
    const { data } = await this.request.get<OmegaScansGetMangas>('/query', {
      params: {
        perPage: 100,
        page,
        adult,
      },
    });

    return data.data.map((manga) => ({
      id: manga.id.toString(),
      title: manga.title,
      abstract: manga.description,
      image: manga.thumbnail,
      url: 'url',
      releasedAt: new Date(manga.created_at),
      isCompleted: manga.status === 'Completed',
      genres: [],
      score: manga.rating ?? 0,
      chaptersCount: parseInt(manga.meta.chapters_count, 10),
    }));
  }
}
