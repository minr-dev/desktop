import { IpcChannel } from '@shared/constants';
import { IAuthProxy } from './IAuthProxy';
import { injectable } from 'inversify';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

@injectable()
export class GitHubAuthProxyImpl implements IAuthProxy {
  private loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
  private logger = this.loggerFactory.getLogger('TaskEdit');

  async getAccessToken(): Promise<string | null> {
    if (this.logger.isDebugEnabled()) this.logger.debug('GitHubAuthProxyImpl getAccessToken');
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_GET_ACCESS_TOKEN);
  }
  async authenticate(): Promise<string> {
    if (this.logger.isDebugEnabled()) this.logger.debug(`GitHubAuthProxyImpl authenticate`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_AUTHENTICATE);
  }
  async revoke(): Promise<void> {
    if (this.logger.isDebugEnabled()) this.logger.debug(`GitHubAuthProxyImpl revoke`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_REVOKE);
  }
}
