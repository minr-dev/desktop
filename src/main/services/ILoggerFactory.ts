import { ILogger } from '@main/services/ILogger';

export interface ILoggerFactory {
  getLogger(loggerName: string): ILogger;
}
