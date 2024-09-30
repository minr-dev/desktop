import { IWinstonLogger } from '@main/services/IWinstonLogger';

export interface ILoggerFactory {
  getLogger(params: { loggerName: string; processType: string }): IWinstonLogger;
}
