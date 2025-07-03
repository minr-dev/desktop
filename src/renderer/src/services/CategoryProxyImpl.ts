import { IpcChannel } from '@shared/constants';
import { injectable } from 'inversify';
import { ICategoryProxy } from './ICategoryProxy';
import { Category } from '@shared/data/Category';
import { Page, Pageable } from '@shared/data/Page';
import { handleIpcOperation } from './ipcErrorHandling';

@injectable()
export class CategoryProxyImpl implements ICategoryProxy {
  async list(pageable: Pageable): Promise<Page<Category>> {
    return await handleIpcOperation(async () => {
      const response = await window.electron.ipcRenderer.invoke(
        IpcChannel.CATEGORY_LIST,
        pageable.toPageRequest()
      );
      return Page.fromPageResponse(response);
    });
  }

  async get(id: string): Promise<Category> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.CATEGORY_GET, id);
    });
  }

  async save(category: Category): Promise<Category> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.CATEGORY_SAVE, category);
    });
  }

  async delete(id: string): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.CATEGORY_DELETE, id);
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.CATEGORY_BULK_DELETE, ids);
    });
  }
}
