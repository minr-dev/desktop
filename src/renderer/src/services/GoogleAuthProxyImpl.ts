import { IpcChannel } from '@shared/constants';
import { IAuthProxy } from './IAuthProxy';
import { injectable } from 'inversify';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('GoogleAuthProxyImpl');

@injectable()
export class GoogleAuthProxyImpl implements IAuthProxy {
  async getAccessToken(): Promise<string | null> {
    if (logger.isDebugEnabled()) logger.debug('getAccessToken');
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_GET_ACCESS_TOKEN);
  }
  async authenticate(): Promise<string> {
    if (logger.isDebugEnabled()) logger.debug(`GoogleAuthProxyImpl authenticate`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_AUTHENTICATE);
  }
  async revoke(): Promise<void> {
    if (logger.isDebugEnabled()) logger.debug(`GoogleAuthProxyImpl revoke`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_REVOKE);
  }
}
