import { IpcChannel } from '@shared/constants';
import { IAuthProxy } from './IAuthProxy';
import { injectable } from 'inversify';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { TYPES } from '@renderer/types';

@injectable()
export class GoogleAuthProxyImpl implements IAuthProxy {
  private loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  private logger = this.loggerFactory.getLogger({
    processType: 'renderer',
    loggerName: 'TaskEdit',
  });

  async getAccessToken(): Promise<string | null> {
    this.logger.info('getAccessToken');
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_GET_ACCESS_TOKEN);
  }
  async authenticate(): Promise<string> {
    this.logger.info(`GoogleAuthProxyImpl authenticate`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_AUTHENTICATE);
  }
  async revoke(): Promise<void> {
    this.logger.info(`GoogleAuthProxyImpl revoke`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_REVOKE);
  }
}
