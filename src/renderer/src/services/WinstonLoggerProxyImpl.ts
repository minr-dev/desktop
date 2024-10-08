import { IpcChannel } from '@shared/constants';
import { WinstonLogMessage } from '@shared/data/WinstonLogMessage';
import type { IWinstonLoggerProxy, WinstonSetting } from './IWinstonLoggerProxy';
import { injectable } from 'inversify';

@injectable()
export class WinstonLoggerProxyImpl implements IWinstonLoggerProxy {
  private loggerSetting: WinstonSetting;

  constructor() {
    this.loggerSetting = {
      processType: 'undefined',
      loggerName: 'undefined',
      isDebugEnabled: false,
    };
    this.setIsDebugEnabled();
  }

  async setName(loggerName: string): Promise<void> {
    this.loggerSetting.loggerName = loggerName;
  }

  async setProcessType(processType: string): Promise<void> {
    this.loggerSetting.processType = processType;
  }

  async setIsDebugEnabled(): Promise<void> {
    this.loggerSetting.isDebugEnabled = await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_ISDEBUGENABLED);
  }

  async info(message: string): Promise<void> {
    const logData: WinstonLogMessage = {
      processType: this.loggerSetting.processType,
      loggerName: this.loggerSetting.loggerName,
      message: message,
    };
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_INFO, logData);
  }

  async warn(message: string): Promise<void> {
    const logData: WinstonLogMessage = {
      processType: this.loggerSetting.processType,
      loggerName: this.loggerSetting.loggerName,
      message: message,
    };
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_WARN, logData);
  }

  async error(message: string): Promise<void> {
    const logData: WinstonLogMessage = {
      processType: this.loggerSetting.processType,
      loggerName: this.loggerSetting.loggerName,
      message: message,
    };
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_ERROR, logData);
  }

  async debug(message: string): Promise<void> {
    const logData: WinstonLogMessage = {
      processType: this.loggerSetting.processType,
      loggerName: this.loggerSetting.loggerName,
      message: message,
    };
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_DEBUG, logData);
  }

  isDebugEnabled(): boolean {
    return this.loggerSetting.isDebugEnabled;
  }
}
