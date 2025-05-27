import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';
import { IPlanTemplateEventProxy } from './IPlanTemplateEventProxy';
import { IpcChannel } from '@shared/constants';
import { handleIpcOperation } from './ipcErrorHandling';
import { injectable } from 'inversify';
import { Time } from '@shared/data/Time';

@injectable()
export class PlanTemplateEventProxyImpl implements IPlanTemplateEventProxy {
  async list(userId: string, templateId: string): Promise<PlanTemplateEvent[]> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(
        IpcChannel.PLAN_TEMPLATE_EVENT_LIST,
        userId,
        templateId
      );
    });
  }
  async get(id: string): Promise<PlanTemplateEvent> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.PLAN_TEMPLATE_EVENT_GET, id);
    });
  }
  async bulkUpsert(events: PlanTemplateEvent[]): Promise<PlanTemplateEvent[]> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(
        IpcChannel.PLAN_TEMPLATE_EVENT_BULK_UPSERT,
        events
      );
    });
  }
  async bulkDelete(ids: string[]): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(
        IpcChannel.PLAN_TEMPLATE_EVENT_BULK_DELETE,
        ids
      );
    });
  }
  async create(
    userId: string,
    templateId: string,
    summary: string,
    start: Time,
    end: Time
  ): Promise<PlanTemplateEvent> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(
        IpcChannel.PLAN_TEMPLATE_EVENT_CREATE,
        userId,
        templateId,
        summary,
        start,
        end
      );
    });
  }
}
