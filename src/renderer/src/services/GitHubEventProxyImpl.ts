import { IpcChannel } from '@shared/constants';
import { injectable } from 'inversify';
import { IGitHubEventProxy } from './IGItHubEventProxy';
import { GitHubEvent } from '@shared/dto/GitHubEvent';

@injectable()
export class GitHubEventProxyImpl implements IGitHubEventProxy {
  async list(start: Date, end: Date): Promise<GitHubEvent[]> {
    const data = await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_EVENT_LIST, start, end);
    return data;
  }
}
