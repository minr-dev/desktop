import { inject, injectable } from 'inversify';
import { format } from 'util';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { TYPES } from '@main/types';
import type { ILogger, PROCESS_TYPE } from '@main/services/ILogger';
import type { ILoggerInitializer } from '@main/services/ILoggerInitializer';

@injectable()
export class WinstonLoggerImpl implements ILogger {
  private logger;
  private processType = '';
  private loggerName = '';

  constructor(
    @inject(TYPES.WinstonInitializer)
    private readonly winstonInitializer: ILoggerInitializer<winston.Logger>
  ) {
    this.logger = this.winstonInitializer.getLogger();
  }

  setName(loggerName: string): void {
    this.loggerName = loggerName;
  }

  setProcessType(processType: PROCESS_TYPE): void {
    this.processType = processType;
  }

  info(message: unknown, ...meta: unknown[]): void {
    this.logger.info({
      processType: this.processType,
      loggerName: this.loggerName,
      message: format(message, ...meta),
    });
  }

  warn(message: unknown, ...meta: unknown[]): void {
    this.logger.warn({
      processType: this.processType,
      loggerName: this.loggerName,
      message: format(message, ...meta),
    });
  }

  error(message: unknown, ...meta: unknown[]): void {
    this.logger.error({
      processType: this.processType,
      loggerName: this.loggerName,
      message: format(message, ...meta),
    });
  }

  debug(message: unknown, ...meta: unknown[]): void {
    this.logger.debug({
      processType: this.processType,
      loggerName: this.loggerName,
      message: format(message, ...meta),
    });
  }

  isDebugEnabled(): boolean {
    return this.logger.level === 'debug';
  }
}
