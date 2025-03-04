interface MicroChapter {
  id: number;
  chapter_name: string;
  chapter_title: null;
  chapter_slug: string;
  chapters_to_be_freed: [];
  meta: object;
}

export interface OmegaScansGetChapterDetails {
  chapter: {
    id: number;
    series_id: number;
    season_id: number;
    index: string;
    chapter_name: string;
    chapter_title: null;
    chapter_data: {
      images: string[];
    };
    chapter_content: null;
    chapter_thumbnail: string;
    chapter_slug: string;
    chapter_unique_id: string;
    views: number;
    chapter_type: string;
    price: number;
    created_at: string;
    updated_at: string;
    storage: string;
    public: boolean;
    release_date: null;
    series: {
      id: number;
      series_slug: string;
      thumbnail: string;
      title: string;
      latest_chapter: null;
      meta: object;
    };
    who_bought: { id: number }[];
    chapters_to_be_freed: [];
    meta: {
      continuation: null;
    };
  };
  previous_chapter?: MicroChapter;
  next_chapter?: MicroChapter;
}
