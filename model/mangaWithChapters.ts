import { Chapter } from './chapter';
import { Manga } from './manga';

export interface MangaWithChapters extends Manga {
  chapters: Chapter[];
}
