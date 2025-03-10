import { Chapter } from './chapter';

export enum Status {
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  Hiatus = 'Hiatus',
  Cancelled = 'Cancelled',
  Unknown = 'Unknown',
}

export interface Manga {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  image?: string;
  url: string;
  releasedAt?: string;
  status: Status;
  genres: string[];
  score?: number;
  chaptersCount: number;
  chapters: Chapter[];
}

export type MangaWithoutChapters = Omit<Manga, 'chapters'>;
