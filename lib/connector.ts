import { Manga } from '../interfaces/manga';

export abstract class Connector {
  abstract getMangas(search?: string): Omit<Manga, 'chapters'>[];
  abstract getManga(id: string): Manga;
}
