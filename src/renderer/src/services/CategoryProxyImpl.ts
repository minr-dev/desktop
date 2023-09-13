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

  async get(id: string): Promise<Category> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.CATEGORY_GET, id);
  }

  async create(): Promise<Category> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.CATEGORY_CREATE);
  }

  async save(category: Category): Promise<void> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.CATEGORY_SAVE, category);
  }

  async delete(id: string): Promise<void> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.CATEGORY_DELETE, id);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.CATEGORY_BULK_DELETE, ids);
  }
}
