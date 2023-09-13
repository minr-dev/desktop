import { IpcChannel } from '@shared/constants';
import { injectable } from 'inversify';
import { ICategoryProxy } from './ICategoryProxy';
import { Category } from '@shared/data/Category';
import { Page, Pageable } from '@shared/data/Page';

@injectable()
export class CategoryProxyImpl implements ICategoryProxy {
  async list(pageable: Pageable): Promise<Page<Category>> {
    const responce = await window.electron.ipcRenderer.invoke(
      IpcChannel.CATEGORY_LIST,
      pageable.toPageRequest()
    );
    return Page.fromPageResponse(responce);
  }
}
