import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { IActualAutoRegistrationService } from '@main/services/IAutoRegisterActualService';

@injectable()
export class AutoRegisterActualServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.ActualAutoRegistrationService)
    private readonly autoRegisterActualService: IActualAutoRegistrationService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.AUTO_REGISTER_PROVISIONAL_ACTUALS, async (_event, targetDate) => {
      return await this.autoRegisterActualService.autoRegisterProvisionalActuals(targetDate);
    });

    ipcMain.handle(IpcChannel.CONFIRM_ACTUAL_REGISTRATION, async (_event, targetDate) => {
      return await this.autoRegisterActualService.confirmActualRegistration(targetDate);
    });

    ipcMain.handle(IpcChannel.DELETE_PROVISONAL_ACTUALS, async (_event, targetDate) => {
      return await this.autoRegisterActualService.deleteProvisionalActuals(targetDate);
    });
  }
}
