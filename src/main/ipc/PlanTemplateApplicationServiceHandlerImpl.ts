import { inject, injectable } from 'inversify';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import type { IPlanTemplateApplicationService } from '@main/services/IPlanTemplateApplicationService';
import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { handleDatabaseOperation } from './dbHandlerUtil';

@injectable()
export class PlanTemplateApplicationServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.PlanTemplateApplicationService)
    private readonly planTemplateApplicationService: IPlanTemplateApplicationService
  ) {}
  init(): void {
    ipcMain.handle(IpcChannel.APPLY_PLAN_TEMPLATE, async (_event, targetDate, templateId) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.planTemplateApplicationService.applyTemplate(targetDate, templateId);
      });
    });
  }
}
