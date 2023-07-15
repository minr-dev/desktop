import { IAuthProxy } from './IAuthProxy';

export class GoogleAuthProxyImpl implements IAuthProxy {
  async getAccessToken(): Promise<string | null> {
    console.log('getAccessToken');
    return await window.electron.ipcRenderer.invoke('google-getAccessToken');
  }
  async authenticate(): Promise<string> {
    console.log(`GoogleAuthProxyImpl authenticate`);
    return await window.electron.ipcRenderer.invoke('google-authenticate');
  }
  async revoke(): Promise<void> {
    console.log(`GoogleAuthProxyImpl revoke`);
    return await window.electron.ipcRenderer.invoke('google-revoke');
  }
}
