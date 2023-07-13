import { IAuthProxy } from './IAuthProxy';

export class GoogleAuthProxyImpl implements IAuthProxy {
  async getAccessToken(): Promise<string | null> {
    console.log('getAccessToken');
    return await window.electron.ipcRenderer.invoke('google-getAccessToken');
  }
  async authenticate(): Promise<string> {
    return await window.electron.ipcRenderer.invoke('google-authenticate');
  }
  async revoke(): Promise<void> {
    return await window.electron.ipcRenderer.invoke('google-revoke');
  }
}
