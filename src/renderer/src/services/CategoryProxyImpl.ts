import { IpcChannel } from '@shared/constants';
import { injectable } from 'inversify';
import { ICategoryProxy } from './ICategoryProxy';
import { Category } from '@shared/data/Category';
import { Page, PageResponse, Pageable } from '@shared/data/Page';

@injectable()
export class CategoryProxyImpl implements ICategoryProxy {
  async list(pageable: Pageable): Promise<Page<Category>> {
    // const data = await window.electron.ipcRenderer.invoke(
    //   IpcChannel.CATEGORY_LIST,
    //   pageable.toPageRequest()
    // );
    const data: PageResponse<Category> = {
      content: [
        {
          id: '11',
          name: 'カテゴリー1',
          description: '説明1',
          color: '#ff0000',
          updated: new Date(),
        },
        {
          id: '12',
          name: 'カテゴリー2',
          description: '説明2',
          color: '#00ff00',
          updated: new Date(),
        },
      ],
      pageRequest: pageable.toPageRequest(),
      totalPages: 1,
      totalElements: 2,
    };
    return Page.fromPageResponse(data);
  }
}
