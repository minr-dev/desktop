import { inject, injectable } from 'inversify';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { IGitHubProjectV2SyncService } from '@main/services/IGitHubProjectV2SyncService';
import { TYPES } from '@main/types';
import { ipcMain } from 'electron';
import { handleDatabaseOperation } from './dbHandlerUtil';
import { IpcChannel } from '@shared/constants';

@injectable()
export class GitHubProjectV2SyncHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.GitHubProjectV2SyncService)
    private readonly gitHubProjectV2SyncService: IGitHubProjectV2SyncService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.GITHUB_PROJECT_V2_SYNC_GITHUB_PROJECT_V2, async () => {
      return handleDatabaseOperation(async (): Promise<void> => {
        await this.gitHubProjectV2SyncService.syncGitHubProjectV2();
      });
    });

    ipcMain.handle(IpcChannel.GITHUB_PROJECT_V2_SYNC_ORGANIZATION, async () => {
      return handleDatabaseOperation(async (): Promise<void> => {
        await this.gitHubProjectV2SyncService.syncOrganization();
      });
    });
  }
}
