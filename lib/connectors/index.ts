import axios from 'axios';

import { Manga } from '../../model/manga';
import { MangaWithChapters } from '../../model/mangaWithChapters';

export abstract class Connector {
  protected request = axios.create();

  abstract getMangas(search?: string): Promise<Manga[]>;
  abstract getManga(id: string): Promise<MangaWithChapters>;
}
