import { Application } from '@shared/data/Application';
import { IApplicationProxy as IApplicationProxy } from './IApplicationProxy';
import { injectable } from 'inversify';
import { IpcChannel } from '@shared/constants';
import { handleIpcOperation } from './ipcErrorHandling';
import { Page, Pageable } from '@shared/data/Page';

@injectable()
export class ApplicationProxyImpl implements IApplicationProxy {
  async list(pageable: Pageable): Promise<Page<Application>> {
    return await handleIpcOperation(async () => {
      const responce = await window.electron.ipcRenderer.invoke(
        IpcChannel.APPLICATION_LIST,
        pageable.toPageRequest()
      );
      return Page.fromPageResponse(responce);
    });
  }

  async get(id: string): Promise<Application> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.APPLICATION_GET, id);
    });
  }

  async save(application: Application): Promise<Application> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.APPLICATION_SAVE, application);
    });
  }

  async delete(id: string): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.APPLICATION_DELETE, id);
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.APPLICATION_BULK_DELETE, ids);
    });
  }

  async getByName(basename: string): Promise<Application | null> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.APPLICATION_GET_BY_NAME, basename);
    });
  }
}
