import type { ILogger } from '@main/services/ILogger';
import { inject, injectable } from 'inversify';
import { ILoggerFactory } from './ILoggerFactory';

@injectable()
export class LoggerFactoryImpl implements ILoggerFactory {
  constructor(
    @inject('WinstonLogger')
    private readonly winstonLogger: ILogger
  ) {}

  getLogger(loggerName: string): ILogger {
    this.winstonLogger.setName(loggerName);
    this.winstonLogger.setProcessType('main');
    return this.winstonLogger;
  }
}
