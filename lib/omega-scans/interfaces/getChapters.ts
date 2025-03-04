import { OmegaScansCommonMeta } from './commonMeta';

interface Chapter {
  id: number;
  chapter_name: string;
  chapter_title: null;
  chapter_thumbnail: string;
  chapter_slug: string;
  price: number;
  created_at: string;
  series: {
    series_slug: string;
    id: number;
    latest_chapter: null;
    meta: object;
  };
  meta: {
    continuation: null;
  };
}

export interface OmegaScansGetChapters {
  data: Chapter[];
  meta: OmegaScansCommonMeta;
}
