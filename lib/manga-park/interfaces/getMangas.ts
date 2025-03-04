import { MangaParkCommonData } from './commonData';

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
