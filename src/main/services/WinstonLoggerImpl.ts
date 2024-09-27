import { TYPES } from '@main/types';
import { WinstonLogMessage } from '@shared/data/WinstonLogMessage';
import type { ILogger } from '@shared/utils/ILogger';
import { inject, injectable } from 'inversify';

@injectable()
export class WinstonLoggerImpl implements ILogger<string> {
  private logData: WinstonLogMessage = {
    processType: 'main',
    loggerName: 'undefined',
    message: '',
  };

  constructor(
    @inject(TYPES.WinstonWriter)
    private readonly writer: ILogger<WinstonLogMessage>
  ) {
    this.logData.loggerName = 'undefined';
  }

  info(message: string): void {
    this.logData.message = message;
    this.writer.info(this.logData);
  }

  warn(message: string): void {
    this.logData.message = message;
    this.writer.warn(this.logData);
  }

  error(message: string): void {
    this.logData.message = message;
    this.writer.error(this.logData);
  }

  debug(message: string): void {
    this.logData.message = message;
    this.writer.debug(this.logData);
  }

  isDebugEnabled(): boolean {
    return this.writer.isDebugEnabled();
  }
}
