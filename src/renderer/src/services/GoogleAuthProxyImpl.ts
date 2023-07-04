import { IAuthProxy } from './IAuthProxy';

export class GoogleAuthProxyImpl implements IAuthProxy {
  async start(): Promise<string> {
    return await window.electron.ipcRenderer.invoke('google-auth');
  }
}
