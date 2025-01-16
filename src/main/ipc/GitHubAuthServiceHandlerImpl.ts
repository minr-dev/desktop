import { IpcChannel } from '@shared/constants';
import { IpcMainInvokeEvent, ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IDeviceFlowAuthService } from '@main/services/IDeviceFlowAuthService';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import { getLogger } from '@main/utils/LoggerUtil';

const logger = getLogger('GitHubAuthServiceHandlerImpl');

/**
 * GitHub認証に関連した処理の IPC ハンドラー
 */
@injectable()
export class GitHubAuthServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.GitHubAuthService)
    private readonly githubAuthService: IDeviceFlowAuthService
  ) {}

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.GITHUB_AUTHENTICATE, async (_event: IpcMainInvokeEvent) => {
      logger.info(`ipcMain handle ${IpcChannel.GITHUB_AUTHENTICATE}`);
      return await this.githubAuthService.authenticate();
    });
    ipcMain.handle(
      IpcChannel.GITHUB_SHOW_USER_CODE_INPUT_WINDOW,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (_event: IpcMainInvokeEvent) => {
        logger.info(`ipcMain handle ${IpcChannel.GITHUB_SHOW_USER_CODE_INPUT_WINDOW}`);
        return await this.githubAuthService.showUserCodeInputWindow();
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.GITHUB_GET_ACCESS_TOKEN, async (_event: IpcMainInvokeEvent) => {
      logger.info(`ipcMain handle ${IpcChannel.GITHUB_GET_ACCESS_TOKEN}`);
      return await this.githubAuthService.getAccessToken();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.GITHUB_REVOKE, async (_event: IpcMainInvokeEvent) => {
      logger.info(`ipcMain handle ${IpcChannel.GITHUB_REVOKE}`);
      return await this.githubAuthService.revoke();
    });
  }
}
