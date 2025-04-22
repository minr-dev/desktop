import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { IPlanAutoRegistrationService } from '@main/services/IPlanAutoRegistrationService';

@injectable()
export class PlanAutoRegistrationServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.PlanAutoRegistrationService)
    private readonly planAutoRegistrationService: IPlanAutoRegistrationService
  ) {}

  init(): void {
    ipcMain.handle(
      IpcChannel.AUTO_REGISTER_PROVISIONAL_PLANS,
      async (_event, targetDate, taskExtraHours?, projectId?) => {
        return await this.planAutoRegistrationService.autoRegisterProvisional({
          targetDate: targetDate,
          taskExtraHours: taskExtraHours,
          projectId: projectId,
        });
      }
    );

    ipcMain.handle(IpcChannel.CONFIRM_PLAN_REGISTRATION, async (_event, targetDate) => {
      return await this.planAutoRegistrationService.confirmRegistration(targetDate);
    });

    ipcMain.handle(IpcChannel.DELETE_PROVISONAL_PLANS, async (_event, targetDate) => {
      return await this.planAutoRegistrationService.deleteProvisional(targetDate);
    });
  }
}
