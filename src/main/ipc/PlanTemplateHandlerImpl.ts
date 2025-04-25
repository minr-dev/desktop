import { PlanTemplate } from '@shared/data/PlanTemplate';
import { Pageable, PageResponse } from '@shared/data/Page';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { IPlanTemplateService } from '@main/services/IPlanTemplateService';
import { TYPES } from '@main/types';
import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { handleDatabaseOperation } from './dbHandlerUtil';

@injectable()
export class PlanTemplateHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.PlanTemplateService)
    private readonly planTemplateService: IPlanTemplateService
  ) {}
  init(): void {
    ipcMain.handle(IpcChannel.PLAN_TEMPLATE_LIST, async (_event, pageRequest) => {
      return handleDatabaseOperation(async (): Promise<PageResponse<PlanTemplate>> => {
        const page = await this.planTemplateService.list(Pageable.fromPageRequest(pageRequest));
        return page.toPageResponse();
      });
    });
    ipcMain.handle(IpcChannel.PLAN_TEMPLATE_GET, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<PlanTemplate> => {
        return await this.planTemplateService.get(id);
      });
    });
    ipcMain.handle(IpcChannel.PLAN_TEMPLATE_SAVE, async (_event, planTemplate) => {
      return handleDatabaseOperation(async (): Promise<PlanTemplate> => {
        return await this.planTemplateService.save(planTemplate);
      });
    });
    ipcMain.handle(IpcChannel.PLAN_TEMPLATE_DELETE, async (_event, id) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.planTemplateService.delete(id);
      });
    });
    ipcMain.handle(IpcChannel.PLAN_TEMPLATE_BULK_DELETE, async (_event, ids) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.planTemplateService.bulkDelete(ids);
      });
    });
  }
}
