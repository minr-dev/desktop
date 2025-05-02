import { IpcChannel } from '@shared/constants';
import { IDeviceFlowAuthProxy } from './IDeviceFlowAuthProxy';
import { injectable } from 'inversify';
import { getLogger } from '@renderer/utils/LoggerUtil';

const logger = getLogger('GitHubAuthProxyImpl');

@injectable()
export class GitHubAuthProxyImpl implements IDeviceFlowAuthProxy {
  async getAccessToken(): Promise<string | null> {
    if (logger.isDebugEnabled()) logger.debug('GitHubAuthProxyImpl getAccessToken');
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_GET_ACCESS_TOKEN);
  }
  async authenticate(): Promise<string> {
    if (logger.isDebugEnabled()) logger.debug(`GitHubAuthProxyImpl authenticate`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_AUTHENTICATE);
  }
  async showUserCodeInputWindow(): Promise<void> {
    if (logger.isDebugEnabled()) logger.debug(`GitHubAuthProxyImpl showUserCodeInputWindow`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_SHOW_USER_CODE_INPUT_WINDOW);
  }
  async abortPolling(): Promise<void> {
    if (logger.isDebugEnabled()) logger.debug(`GitHubAuthProxyImpl abortPolling`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_ABORT_POLLING);
  }
  async revoke(): Promise<void> {
    if (logger.isDebugEnabled()) logger.debug(`GitHubAuthProxyImpl revoke`);
    return await window.electron.ipcRenderer.invoke(IpcChannel.GITHUB_REVOKE);
  }
}
