import { inject, injectable } from 'inversify';
import { TYPES } from '@renderer/types';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import type { ILoggerProxy } from '@renderer/services/ILoggerProxy';

@injectable()
export class LoggerFactoryImpl implements ILoggerFactory {
  constructor(
    @inject(TYPES.LoggerProxy)
    private readonly logger: ILoggerProxy
  ) {}

  getLogger(loggerName: string): ILoggerProxy {
    this.logger.setName(loggerName);
    return this.logger;
  }
}
