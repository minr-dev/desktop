import { IpcChannel } from '@shared/constants';
import { IAuthProxy } from './IAuthProxy';

export class GoogleAuthProxyImpl implements IAuthProxy {
  async getAccessToken(): Promise<string | null> {
    console.log('getAccessToken');
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_GET_ACCESS_TOKEN);
  }
  async authenticate(): Promise<string> {
    console.log(`GoogleAuthProxyImpl authenticate`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_AUTHENTICATE);
  }
  async revoke(): Promise<void> {
    console.log(`GoogleAuthProxyImpl revoke`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_REVOKE);
  }
}
