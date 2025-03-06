import { MangaParkCommonData } from './commonData';

export interface MangaParkGetMangasResponse {
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
