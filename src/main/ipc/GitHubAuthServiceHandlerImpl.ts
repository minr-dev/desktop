import { IpcChannel } from '@shared/constants';
import { IpcMainInvokeEvent, ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IAuthService } from '@main/services/IAuthService';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import type { ILoggerFactory } from '@main/services/ILoggerFactory';

/**
 * GitHub認証に関連した処理の IPC ハンドラー
 */
@injectable()
export class GitHubAuthServiceHandlerImpl implements IIpcHandlerInitializer {
  private logger;

  constructor(
    @inject(TYPES.GitHubAuthService)
    private readonly githubAuthService: IAuthService,
    @inject('LoggerFactory')
    private readonly loggerFactory: ILoggerFactory
  ) {
    this.logger = this.loggerFactory.getLogger('GitHubAuthServiceHandlerImpl');
  }

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.GITHUB_AUTHENTICATE, async (_event: IpcMainInvokeEvent) => {
      this.logger.info(`ipcMain handle ${IpcChannel.GITHUB_AUTHENTICATE}`);
      return await this.githubAuthService.authenticate();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.GITHUB_GET_ACCESS_TOKEN, async (_event: IpcMainInvokeEvent) => {
      this.logger.info(`ipcMain handle ${IpcChannel.GITHUB_GET_ACCESS_TOKEN}`);
      return await this.githubAuthService.getAccessToken();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.GITHUB_REVOKE, async (_event: IpcMainInvokeEvent) => {
      this.logger.info(`ipcMain handle ${IpcChannel.GITHUB_REVOKE}`);
      return await this.githubAuthService.revoke();
    });
  }
}
