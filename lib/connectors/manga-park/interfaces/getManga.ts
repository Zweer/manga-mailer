import { MangaParkCommonData } from './commonData';

export interface MangaParkGetMangaResponse {
  data: {
    get_comicNode: MangaParkCommonData;
    get_comicChapterList: {
      data: {
        dateCreate?: number;
        dname?: string;
        imageFile?: {
          urlList?: string[];
        };
        serial?: number;
        sfw_result?: boolean;
        title?: string;
        urlPath?: string;
      };
    }[];
  };
}
