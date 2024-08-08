import { MangaParkCommonData } from './commonMangaData';

export interface MangaParkGetMangas {
  data: {
    get_searchComic: {
      paging: {
        page: number;
        pages: number;
      };
      items: MangaParkCommonData[];
    };
  };
}
