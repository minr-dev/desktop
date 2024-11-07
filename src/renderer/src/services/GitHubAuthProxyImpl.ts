import { IpcChannel } from '@shared/constants';
import { IDeviceFlowAuthProxy } from './IDeviceFlowAuthProxy';
import { injectable } from 'inversify';

@injectable()
export class GitHubAuthProxyImpl implements IDeviceFlowAuthProxy {
  async getAccessToken(): Promise<string | null> {
    console.log('GitHubAuthProxyImpl getAccessToken');
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_GET_ACCESS_TOKEN);
  }
  async authenticate(): Promise<string> {
    console.log(`GitHubAuthProxyImpl authenticate`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_AUTHENTICATE);
  }
  async showUserCodeInputWindow(): Promise<void> {
    console.log(`GitHubAuthProxyImpl showUserCodeInputWindow`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_SHOW_USER_CODE_INPUT_WINDOW);
  }
  async revoke(): Promise<void> {
    console.log(`GitHubAuthProxyImpl revoke`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_REVOKE);
  }
}
