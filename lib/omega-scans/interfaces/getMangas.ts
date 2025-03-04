import { OmegaScansCommonMeta } from './commonMeta';

interface Chapter {
  id: number;
  chapter_name: string;
  chapter_slug: string;
  created_at: string; // '2023-04-02T20:26:56.040+00:00',
  series_id: number;
  index: string;
  chapters_to_be_freed: [];
  meta: Record<string, never>;
}

export interface OmegaScansGetMangas {
  meta: OmegaScansCommonMeta;
  data: {
    id: number;
    title: string;
    description: string;
    alternative_names: string;
    series_type: 'Comic' | 'Novel';
    series_slug: string;
    thumbnail: string;
    total_views: number;
    status: 'Ongoing' | 'Completed' | 'Hiatus' | 'Dropped';
    created_at: string; // '2024-07-01T11:30:27.440+00:00',
    updated_at: string; // '2024-07-01T11:30:27.440+00:00',
    badge: string;
    rating?: number;
    release_schedule?: {
      mon?: true;
      tue?: true;
      wed?: true;
      thu?: true;
      fri?: true;
      sat?: true;
      sun?: true;
    };
    nu_link: null;
    is_coming_soon: boolean;
    paid_chapters: Chapter[];
    free_chapters: Chapter[];
    latest_chapter: null;
    meta: {
      latest_update: null;
      folder_slug?: string;
      metadata: Record<string, never>;
      chapters_count: string;
    };
  }[];
}
