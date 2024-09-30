import { TYPES } from '@renderer/types';
import type { IWinstonLoggerProxy } from '@renderer/services/IWinstonLoggerProxy';
import { inject, injectable } from 'inversify';
import { ILoggerFactory } from './ILoggerFactory';

@injectable()
export class LoggerFactoryImpl implements ILoggerFactory {
  constructor(
    @inject(TYPES.WinstonLogger)
    private readonly winstonLogger: IWinstonLoggerProxy
  ) {}

  getLogger(params: { loggerName: string; processType: string }): IWinstonLoggerProxy {
    this.winstonLogger.setName(params.loggerName);
    this.winstonLogger.setProcessType(params.processType);
    return this.winstonLogger;
  }
}
