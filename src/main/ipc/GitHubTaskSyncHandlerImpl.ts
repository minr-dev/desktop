import { inject, injectable } from 'inversify';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import { ipcMain } from 'electron';
import { handleDatabaseOperation } from './dbHandlerUtil';
import { IpcChannel } from '@shared/constants';
import type { IGitHubTaskSyncService } from '@main/services/IGitHubTaskSyncService';

@injectable()
export class GitHubTaskSyncHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.GitHubTaskSyncService)
    private readonly gitHubTaskSyncService: IGitHubTaskSyncService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.GITHUB_TASK_SYNC, async (_event, projectId) => {
      return handleDatabaseOperation(async (): Promise<void> => {
        await this.gitHubTaskSyncService.syncGitHubProjectV2Item(projectId);
      });
    });
  }
}
