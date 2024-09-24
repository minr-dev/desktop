import { TYPES } from '@main/types';
import type { ILogger } from '@shared/utils/ILogger';
import { inject, injectable } from 'inversify';
import winston, { format } from 'winston';
import 'winston-daily-rotate-file';
import Transport from 'winston-transport';

@injectable()
export class WinstonLoggerImpl implements ILogger {
  private formatter;
  private stringTransport;

  constructor(
    @inject(TYPES.WinstonWriter)
    private readonly writer: ILogger
  ) {
    const processType = 'main';
    const name = 'undefined';
    this.stringTransport = new StringTransport({
      level: 'debug',
      format: winston.format.combine(
        winston.format.printf(({ level, message }) => {
          return `[${level}]<${processType}><${name}>: ${message}`;
        })
      ),
    });
    this.formatter = winston.createLogger({
      transports: [this.stringTransport],
    });
  }

  info(message: string): void {
    this.formatter.info(message);
    const formatMessage = this.stringTransport.getLogMessage();
    this.writer.info(formatMessage);
  }

  warn(message: string): void {
    this.formatter.warn(message);
    const formatMessage = this.stringTransport.getLogMessage();
    this.writer.warn(formatMessage);
  }

  error(message: string): void {
    this.formatter.error(message);
    const formatMessage = this.stringTransport.getLogMessage();
    this.writer.error(formatMessage);
  }

  debug(message: string): void {
    this.formatter.debug(message);
    const formatMessage = this.stringTransport.getLogMessage();
    this.writer.debug(formatMessage);
  }

  isDebugEnabled(): boolean {
    return this.writer.isDebugEnabled();
  }
}

export class StringTransport extends Transport {
  private MESSAGE = Symbol.for('message');
  private logMessage: string;
  private logFormat;

  constructor(opts) {
    super(opts);
    this.logMessage = '';
    this.logFormat = format.combine(opts.format || format.simple());
  }

  log(info, callback): void {
    setImmediate(() => {
      this.emit('logged', info);
    });
    const formatMessage = this.logFormat.transform(info);
    this.logMessage = formatMessage[this.MESSAGE];
    callback();
  }

  getLogMessage(): string {
    return this.logMessage;
  }
}
