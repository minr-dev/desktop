import { IAuthProxy } from './IAuthProxy';

export class GoogleAuthProxyImpl implements IAuthProxy {
  async getAccessToken(): Promise<string | null> {
    return await window.electron.ipcRenderer.invoke('google-getAccessToken');
  }
  async authenticate(): Promise<string> {
    return await window.electron.ipcRenderer.invoke('google-authenticate');
  }
}
