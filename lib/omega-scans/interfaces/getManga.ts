interface Season {
  id: number;
  series_id: number;
  season_name: string;
  index: number;
  created_at: string;
  updated_at: string;
}

export interface OmegaScansGetManga {
  id: number;
  title: string;
  series_slug: string;
  thumbnail: string;
  total_views: number;
  description: string;
  series_type: 'Comic' | 'Novel';
  tags: [];
  rating?: number;
  status: 'Ongoing' | 'Completed' | 'Hiatus' | 'Dropped';
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
  seasons: Season[];
  alternative_names: string;
  studio: string;
  author: string;
  release_year: string;
  meta: {
    latest_update: null;
    folder_slug: string;
    metadata: Record<string, never>;
    chapters_count: string;
    who_bookmarked_count: string;
  };
}
