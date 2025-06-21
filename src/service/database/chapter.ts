export interface Chapter {
  mangaId: string; // connector:id
  id: string;
  title?: string;
  index: number;
  url: string;
  releasedAt?: Date;
  images: string[];
}
