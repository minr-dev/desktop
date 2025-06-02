import { injectable } from 'inversify';
import { IGitHubTaskSyncProxy } from './IGitHubTaskSyncProxyImpl';
import { IpcChannel } from '@shared/constants';

@injectable()
export class GitHubTaskSyncProxyImpl implements IGitHubTaskSyncProxy {
  async syncGitHubProjectV2Item(minrProjectId: string): Promise<void> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_TASK_SYNC, minrProjectId);
  }
}
