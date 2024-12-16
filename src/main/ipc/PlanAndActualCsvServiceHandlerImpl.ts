import type { IPlanAndActualCsvService } from '@main/services/IPlanAndActualCsvService';
import { TYPES } from '@main/types';
import { IpcChannel } from '@shared/constants';
import { PlanAndActualCsvSetting } from '@shared/data/PlanAndActualCsvSetting';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';

@injectable()
export class PlanAndActualCsvServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.PlanAndActualCsvService)
    private readonly planAndActualCsvService: IPlanAndActualCsvService
  ) {}

  init(): void {
    ipcMain.handle(
      IpcChannel.PLAN_AND_ACTUAL_CSV_CREATE,
      async (_event, planAndActualCsvSetting: PlanAndActualCsvSetting) => {
        const data = await this.planAndActualCsvService.createCsv(planAndActualCsvSetting);
        return data;
      }
    );
  }
}
