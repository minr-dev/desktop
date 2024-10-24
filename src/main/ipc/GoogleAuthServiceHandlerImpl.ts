import { IpcChannel } from '@shared/constants';
import { IpcMainInvokeEvent, ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IAuthService } from '@main/services/IAuthService';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import { getLogger } from '@main/utils/LoggerUtil';

const logger = getLogger('GoogleAuthServiceHandlerImpl');

@injectable()
export class GoogleAuthServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.GoogleAuthService)
    private readonly googleAuthService: IAuthService
  ) {}

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.GOOGLE_AUTHENTICATE, async (_event: IpcMainInvokeEvent) => {
      logger.info(`ipcMain handle ${IpcChannel.GOOGLE_AUTHENTICATE}`);
      return await this.googleAuthService.authenticate();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.GOOGLE_GET_ACCESS_TOKEN, async (_event: IpcMainInvokeEvent) => {
      logger.info(`ipcMain handle ${IpcChannel.GOOGLE_GET_ACCESS_TOKEN}`);
      return await this.googleAuthService.getAccessToken();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.GOOGLE_REVOKE, async (_event: IpcMainInvokeEvent) => {
      logger.info(`ipcMain handle ${IpcChannel.GOOGLE_REVOKE}`);
      return await this.googleAuthService.revoke();
    });
  }
}
