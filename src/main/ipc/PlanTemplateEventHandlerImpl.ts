import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { IPlanTemplateEventService } from '@main/services/IPlanTemplateEventService';
import { TYPES } from '@main/types';
import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { handleDatabaseOperation } from './dbHandlerUtil';
import { PlanTemplateEventFactory } from '@main/services/PlanTemplateEventFactory';
import { Time } from '@shared/data/Time';

@injectable()
export class PlanTemplateEventHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.PlanTemplateEventService)
    private readonly planTemplateEventService: IPlanTemplateEventService
  ) {}
  init(): void {
    ipcMain.handle(IpcChannel.PLAN_TEMPLATE_EVENT_LIST, async (_event, userId, templateId) => {
      return handleDatabaseOperation(async (): Promise<PlanTemplateEvent[]> => {
        return await this.planTemplateEventService.list(userId, templateId);
      });
    });
    ipcMain.handle(IpcChannel.PLAN_TEMPLATE_EVENT_GET, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<PlanTemplateEvent> => {
        return await this.planTemplateEventService.get(id);
      });
    });
    ipcMain.handle(IpcChannel.PLAN_TEMPLATE_EVENT_BULK_UPSERT, async (_event, events) => {
      return handleDatabaseOperation(async (): Promise<PlanTemplateEvent[]> => {
        return await this.planTemplateEventService.bulkUpsert(events);
      });
    });
    ipcMain.handle(IpcChannel.PLAN_TEMPLATE_EVENT_BULK_DELETE, async (_event, ids) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.planTemplateEventService.bulkDelete(ids);
      });
    });
    ipcMain.handle(
      IpcChannel.PLAN_TEMPLATE_EVENT_CREATE,
      async (
        _event,
        userId: string,
        templateId: string,
        summary: string,
        start: Time,
        end: Time
      ) => {
        return PlanTemplateEventFactory.create({
          userId,
          templateId,
          summary,
          start,
          end,
        });
      }
    );
  }
}
