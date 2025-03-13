import { injectable } from 'inversify';
import { PlanPattern } from '@shared/data/PlanPattern';
import { IPlanPatternProxy } from './IPlanPatternProxy';
import { IpcChannel } from '@shared/constants';
import { handleIpcOperation } from './ipcErrorHandling';
import { Page, Pageable } from '@shared/data/Page';

@injectable()
export class PlanPatternProxyImpl implements IPlanPatternProxy {
  async list(pageable: Pageable): Promise<Page<PlanPattern>> {
    return await handleIpcOperation(async () => {
      const responce = await window.electron.ipcRenderer.invoke(
        IpcChannel.PLAN_PATTERN_LIST,
        pageable.toPageRequest()
      );
      return Page.fromPageResponse(responce);
    });
  }

  async get(id: string): Promise<PlanPattern> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PLAN_PATTERN_GET, id);
    });
  }

  async save(planPattern: PlanPattern): Promise<PlanPattern> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PLAN_PATTERN_SAVE, planPattern);
    });
  }

  async delete(id: string): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PLAN_PATTERN_DELETE, id);
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PLAN_PATTERN_BULK_DELETE, ids);
    });
  }
}
