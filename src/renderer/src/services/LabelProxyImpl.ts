import { IpcChannel } from '@shared/constants';
import { injectable } from 'inversify';
import { ILabelProxy } from './ILabelProxy';
import { Label } from '@shared/data/Label';
import { Page, Pageable } from '@shared/data/Page';
import { handleIpcOperation } from './ipcErrorHandling';

@injectable()
export class LabelProxyImpl implements ILabelProxy {
  async list(pageable: Pageable): Promise<Page<Label>> {
    return await handleIpcOperation(async () => {
      const responce = await window.electron.ipcRenderer.invoke(
        IpcChannel.LABEL_LIST,
        pageable.toPageRequest()
      );
      return Page.fromPageResponse(responce);
    });
  }

  async get(id: string): Promise<Label> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.LABEL_GET, id);
    });
  }

  async save(Label: Label): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.LABEL_SAVE, Label);
    });
  }

  async delete(id: string): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.LABEL_DELETE, id);
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.LABEL_BULK_DELETE, ids);
    });
  }
}
