import { Pattern } from '@shared/data/Pattern';
import { IPatternProxy } from './IPatternProxy';
import { injectable } from 'inversify';
import { IpcChannel } from '@shared/constants';
import { handleIpcOperation } from './ipcErrorHandling';
import { Page, Pageable } from '@shared/data/Page';

@injectable()
export class PatternProxyImpl implements IPatternProxy {
  async list(pageable: Pageable): Promise<Page<Pattern>> {
    return await handleIpcOperation(async () => {
      const response = await window.electron.ipcRenderer.invoke(
        IpcChannel.PATTERN_LIST,
        pageable.toPageRequest()
      );
      return Page.fromPageResponse(response);
    });
  }

  async get(id: string): Promise<Pattern> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PATTERN_GET, id);
    });
  }

  async save(pattern: Pattern): Promise<Pattern> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PATTERN_SAVE, pattern);
    });
  }

  async delete(id: string): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PATTERN_DELETE, id);
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PATTERN_BULK_DELETE, ids);
    });
  }
}
