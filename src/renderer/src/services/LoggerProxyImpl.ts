import { IpcChannel } from '@shared/constants';
import { LogMessage } from '@shared/data/LogMessage';
import { injectable } from 'inversify';
import { ILoggerProxy } from './ILoggerProxy';

@injectable()
export class LoggerProxyImpl implements ILoggerProxy {
  private loggerName = '';
  private debugEnabled = false;

  constructor() {
    this.setIsDebugEnabled();
  }

  async setName(loggerName: string): Promise<void> {
    this.loggerName = loggerName;
  }

  async setIsDebugEnabled(): Promise<void> {
    this.debugEnabled = await window.electron.ipcRenderer.invoke(
      IpcChannel.WINSTON_LOGGER_ISDEBUGENABLED
    );
  }

  async info(message: unknown, ...meta: unknown[]): Promise<void> {
    const logData: LogMessage = {
      loggerName: this.loggerName,
      message: message,
      meta,
    };
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_INFO, logData);
  }

  async warn(message: unknown, ...meta: unknown[]): Promise<void> {
    const logData: LogMessage = {
      loggerName: this.loggerName,
      message: message,
      meta,
    };
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_WARN, logData);
  }

  async error(message: unknown, ...meta: unknown[]): Promise<void> {
    const logData: LogMessage = {
      loggerName: this.loggerName,
      message: message,
      meta,
    };
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_ERROR, logData);
  }

  async debug(message: unknown, ...meta: unknown[]): Promise<void> {
    const logData: LogMessage = {
      loggerName: this.loggerName,
      message: message,
      meta,
    };
    return await window.electron.ipcRenderer.invoke(IpcChannel.WINSTON_LOGGER_DEBUG, logData);
  }

  isDebugEnabled(): boolean {
    return this.debugEnabled;
  }
}
