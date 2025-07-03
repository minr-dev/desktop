import { IpcChannel } from '@shared/constants';
import { injectable } from 'inversify';
import { ISynchronizerProxy } from './ISynchronizerProxy';

@injectable()
export class GitHubSynchronizerProxyImpl implements ISynchronizerProxy {
  async sync(): Promise<void> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_ACTIVITY_SYNC);
  }
}
