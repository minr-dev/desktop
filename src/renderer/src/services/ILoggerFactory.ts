import { IWinstonLoggerProxy } from '@renderer/services/IWinstonLoggerProxy';

export interface ILoggerFactory {
  getLogger(params: { loggerName: string; processType: string }): IWinstonLoggerProxy;
}
