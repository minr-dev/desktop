import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { IGitHubEventStoreService } from '@main/services/IGitHubEventStoreService';

/**
 * GitHubイベントのローカルに保存されたデータの取得用の IPC ハンドラー
 */
@injectable()
export class GitHubEventStoreHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.GitHubEventStoreService)
    private readonly gitHubEventStoreService: IGitHubEventStoreService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.GITHUB_EVENT_LIST, async (_event, start, end) => {
      return await this.gitHubEventStoreService.list(start, end);
    });
  }
}
