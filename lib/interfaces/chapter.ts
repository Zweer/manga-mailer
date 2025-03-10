export interface Chapter {
  id: string;
  slug: string;
  title?: string;
  index: number;
  url: string;
  releasedAt?: string;
  images: string[];
}
