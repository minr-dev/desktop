import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { PROCESS_TYPE, type ILogger } from '@main/services/ILogger';
import { ILoggerFactory } from '@main/services/ILoggerFactory';

@injectable()
export class LoggerFactoryImpl implements ILoggerFactory {
  constructor(
    @inject(TYPES.WinstonLogger)
    private readonly winstonLogger: ILogger
  ) {}

  getLogger(loggerName: string): ILogger {
    this.winstonLogger.setName(loggerName);
    this.winstonLogger.setProcessType(PROCESS_TYPE.MAIN);
    return this.winstonLogger;
  }
}
