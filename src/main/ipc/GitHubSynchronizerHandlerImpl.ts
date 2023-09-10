import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import type { ITaskProcessor } from '@main/services/ITaskProcessor';

/**
 * GitHubとの同期処理を実行する IPC ハンドラー
 */
@injectable()
export class GitHubSynchronizerHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.GitHubSyncProcessor)
    private readonly synchronizer: ITaskProcessor
  ) {}

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.GITHUB_ACTIVITY_SYNC, async (_event) => {
      return await this.synchronizer.execute();
    });
  }
}
