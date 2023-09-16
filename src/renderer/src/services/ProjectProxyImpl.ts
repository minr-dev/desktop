import { IpcChannel } from '@shared/constants';
import { injectable } from 'inversify';
import { IProjectProxy } from './IProjectProxy';
import { Project } from '@shared/data/Project';
import { Page, Pageable } from '@shared/data/Page';
import { handleIpcOperation } from './ipcErrorHandling';

@injectable()
export class ProjectProxyImpl implements IProjectProxy {
  async list(pageable: Pageable): Promise<Page<Project>> {
    return await handleIpcOperation(async () => {
      const responce = await window.electron.ipcRenderer.invoke(
        IpcChannel.PROJECT_LIST,
        pageable.toPageRequest()
      );
      return Page.fromPageResponse(responce);
    });
  }

  async get(id: string): Promise<Project> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PROJECT_GET, id);
    });
  }

  async save(project: Project): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PROJECT_SAVE, project);
    });
  }

  async delete(id: string): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PROJECT_DELETE, id);
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PROJECT_BULK_DELETE, ids);
    });
  }
}
