import { inject, injectable } from 'inversify';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import type { IPlanTemplateApplyService } from '@main/services/IPlanTemplateApplyService';
import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { handleDatabaseOperation } from './dbHandlerUtil';

@injectable()
export class PlanTemplateApplyServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.PlanTemplateApplyService)
    private readonly planTemplateApplyService: IPlanTemplateApplyService
  ) {}
  init(): void {
    ipcMain.handle(IpcChannel.APPLY_PLAN_TEMPLATE, async (_event, targetDate, templateId) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        return await this.planTemplateApplyService.applyTemplate(targetDate, templateId);
      });
    });
  }
}
