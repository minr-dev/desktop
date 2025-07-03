import { IpcChannel } from '@shared/constants';
import { IAutoLaunchProxy } from './IAutoLaunchProxy';
import { handleIpcOperation } from './ipcErrorHandling';
import { injectable } from 'inversify';

@injectable()
export class AutoLaunchProxyImpl implements IAutoLaunchProxy {
  async setAutoLaunchEnabled(isEnabled: boolean): Promise<void> {
    return await handleIpcOperation(async () => {
      return await window.electron.ipcRenderer.invoke(
        IpcChannel.SET_AUTO_LAUNCH_ENABLED,
        isEnabled
      );
    });
  }
}
