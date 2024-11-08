import { IpcChannel } from '@shared/constants';
import { IAuthProxy } from './IAuthProxy';
import { injectable } from 'inversify';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('TaskEdit');

@injectable()
export class GitHubAuthProxyImpl implements IAuthProxy {
  async getAccessToken(): Promise<string | null> {
    if (logger.isDebugEnabled()) logger.debug('GitHubAuthProxyImpl getAccessToken');
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_GET_ACCESS_TOKEN);
  }
  async authenticate(): Promise<string> {
    if (logger.isDebugEnabled()) logger.debug(`GitHubAuthProxyImpl authenticate`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_AUTHENTICATE);
  }
  async revoke(): Promise<void> {
    if (logger.isDebugEnabled()) logger.debug(`GitHubAuthProxyImpl revoke`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_REVOKE);
  }
}
