export interface Manga {
  id: string;
  title: string;
  abstract?: string;
  image?: string;
  url: string;
  releasedAt?: Date;
  isCompleted: boolean;
  genres: string[];
  score?: number;
  chaptersCount: number;
}
