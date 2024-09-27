import { IpcChannel } from '@shared/constants';
import { WinstonLogMessage } from '@shared/data/WinstonLogMessage';
import type { ILoggerProxy } from '@shared/utils/ILoggerProxy';
import { injectable } from 'inversify';

@injectable()
export class WinstonLoggerProxyImpl implements ILoggerProxy {
  private logData: WinstonLogMessage = {
    processType: 'renderer',
    loggerName: 'undefined',
    message: '',
  };

  constructor() {
    this.logData.loggerName = 'undefined';
  }

  async info(message: string): Promise<void> {
    this.logData.message = message;
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_INFO, this.logData);
  }

  async warn(message: string): Promise<void> {
    this.logData.message = message;
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_WARN, this.logData);
  }

  async error(message: string): Promise<void> {
    this.logData.message = message;
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_ERROR, this.logData);
  }

  async debug(message: string): Promise<void> {
    this.logData.message = message;
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_DEBUG, this.logData);
  }

  async isDebugEnabled(): Promise<boolean> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_ISDEBUGENABLED);
  }
}
