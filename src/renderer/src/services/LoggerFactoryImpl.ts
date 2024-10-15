import type { ILoggerProxy } from '@renderer/services/ILoggerProxy';
import { inject, injectable } from 'inversify';
import { ILoggerFactory } from './ILoggerFactory';

@injectable()
export class LoggerFactoryImpl implements ILoggerFactory {
  constructor(
    @inject('Logger')
    private readonly logger: ILoggerProxy
  ) {}

  getLogger(loggerName: string): ILoggerProxy {
    this.logger.setName(loggerName);
    return this.logger;
  }
}
