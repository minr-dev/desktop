import { IpcChannel } from '@shared/constants';
import { IAuthProxy } from './IAuthProxy';
import { injectable } from 'inversify';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

@injectable()
export class GoogleAuthProxyImpl implements IAuthProxy {
  private loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
  private logger = this.loggerFactory.getLogger('GoogleAuthProxyImpl');

  async getAccessToken(): Promise<string | null> {
    if (this.logger.isDebugEnabled()) this.logger.debug('getAccessToken');
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_GET_ACCESS_TOKEN);
  }
  async authenticate(): Promise<string> {
    if (this.logger.isDebugEnabled()) this.logger.debug(`GoogleAuthProxyImpl authenticate`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_AUTHENTICATE);
  }
  async revoke(): Promise<void> {
    if (this.logger.isDebugEnabled()) this.logger.debug(`GoogleAuthProxyImpl revoke`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_REVOKE);
  }
}
