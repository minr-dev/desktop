import { IpcChannel } from '@shared/constants';
import { IAuthProxy } from './IAuthProxy';
import { injectable } from 'inversify';

@injectable()
export class GithubAuthProxyImpl implements IAuthProxy {
  async getAccessToken(): Promise<string | null> {
    console.log('GithubAuthProxyImpl getAccessToken');
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_GET_ACCESS_TOKEN);
  }
  async authenticate(): Promise<string> {
    console.log(`GithubAuthProxyImpl authenticate`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_AUTHENTICATE);
  }
  async revoke(): Promise<void> {
    console.log(`GithubAuthProxyImpl revoke`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_REVOKE);
  }
}
