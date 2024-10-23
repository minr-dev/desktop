import { ILoggerProxy } from '@renderer/services/ILoggerProxy';

export interface ILoggerFactory {
  getLogger(loggerName: string): ILoggerProxy;
}
