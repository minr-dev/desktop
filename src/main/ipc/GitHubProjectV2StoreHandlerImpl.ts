import { inject, injectable } from 'inversify';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import type { IGitHubProjectV2StoreService } from '@main/services/IGitHubProjectV2StoreService';
import { handleDatabaseOperation } from './dbHandlerUtil';
import { ipcMain } from 'electron';
import { IpcChannel } from '@shared/constants';
import { GitHubProjectV2 } from '@shared/data/GitHubProjectV2';

@injectable()
export class GitHubProjectV2StoreHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.GitHubProjectV2StoreService)
    private readonly gitHubProjectV2StoreService: IGitHubProjectV2StoreService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.GITHUB_PROJECT_V2_LIST, async () => {
      return handleDatabaseOperation(async (): Promise<GitHubProjectV2[]> => {
        return await this.gitHubProjectV2StoreService.list();
      });
    });
  }
}
