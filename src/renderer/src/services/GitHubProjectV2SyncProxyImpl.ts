import { injectable } from 'inversify';
import { IGitHubProjectV2SyncProxy } from './IGitHubProjectV2SyncProxy';
import { IpcChannel } from '@shared/constants';

@injectable()
export class GitHubProjectV2SyncProxyImpl implements IGitHubProjectV2SyncProxy {
  async syncGitHubProjectV2(): Promise<void> {
    return await window.electron.ipcRenderer.invoke(
      IpcChannel.GITHUB_PROJECT_V2_SYNC_GITHUB_PROJECT_V2
    );
  }

  async syncOrganization(): Promise<void> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_PROJECT_V2_SYNC_ORGANIZATION);
  }
}
