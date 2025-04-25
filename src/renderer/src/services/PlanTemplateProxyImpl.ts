import { injectable } from 'inversify';
import { PlanTemplate } from '@shared/data/PlanTemplate';
import { IPlanTemplateProxy } from './IPlanTemplateProxy';
import { IpcChannel } from '@shared/constants';
import { handleIpcOperation } from './ipcErrorHandling';
import { Page, Pageable } from '@shared/data/Page';

@injectable()
export class PlanTemplateProxyImpl implements IPlanTemplateProxy {
  async list(pageable: Pageable): Promise<Page<PlanTemplate>> {
    return await handleIpcOperation(async () => {
      const response = await window.electron.ipcRenderer.invoke(
        IpcChannel.PLAN_TEMPLATE_LIST,
        pageable.toPageRequest()
      );
      return Page.fromPageResponse(response);
    });
  }

  async get(id: string): Promise<PlanTemplate> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PLAN_TEMPLATE_GET, id);
    });
  }

  async save(template: PlanTemplate): Promise<PlanTemplate> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PLAN_TEMPLATE_SAVE, template);
    });
  }

  async delete(id: string): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PLAN_TEMPLATE_DELETE, id);
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PLAN_TEMPLATE_BULK_DELETE, ids);
    });
  }
}
