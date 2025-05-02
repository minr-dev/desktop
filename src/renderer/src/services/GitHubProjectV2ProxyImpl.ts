import { injectable } from 'inversify';
import { IGitHubProjectV2Proxy } from './IGitHubProjectV2Proxy';
import { GitHubProjectV2 } from '@shared/data/GitHubProjectV2';
import { handleIpcOperation } from './ipcErrorHandling';
import { IpcChannel } from '@shared/constants';

@injectable()
export class GitHubProjectV2ProxyImpl implements IGitHubProjectV2Proxy {
  async list(): Promise<GitHubProjectV2[]> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_PROJECT_V2_LIST);
    });
  }
}
