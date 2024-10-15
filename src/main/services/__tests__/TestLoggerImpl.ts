import type { ILogger } from '@main/services/ILogger';
import { injectable } from 'inversify';
import winston from 'winston';
import 'winston-daily-rotate-file';

@injectable()
export class TestLoggerImpl implements ILogger {
  private logger;
  private processType = '';
  private loggerName = '';
  private debugEnabled = '';

  constructor() {
    const logFilePath = './log-test';
    this.setIsDebugEnabled();
    this.logger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss Z' }),
        winston.format.printf(({ timestamp, level, processType, loggerName, message }) => {
          return `${timestamp} [${level}]<${processType}><${loggerName}>: ${message}`;
        })
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: '%DATE%.log',
          dirname: logFilePath,
          datePattern: 'YYYYMMDD',
          zippedArchive: true,
          maxFiles: '30d',
        }),
      ],
      exceptionHandlers: [
        new winston.transports.DailyRotateFile({
          filename: '%DATE%.log',
          dirname: logFilePath,
          datePattern: 'YYYYMMDD',
          zippedArchive: true,
          maxFiles: '30d',
        }),
      ],
    });
  }

  setName(loggerName: string): void {
    this.loggerName = loggerName;
  }

  setProcessType(processType: string): void {
    this.processType = processType;
  }

  setIsDebugEnabled(): void {
    this.debugEnabled = process.env.IS_DEBUG_ENABLED || '';
  }

  info(message: string): void {
    this.logger.info({
      processType: this.processType,
      loggerName: this.loggerName,
      message: message,
    });
  }

  warn(message: string): void {
    this.logger.warn({
      processType: this.processType,
      loggerName: this.loggerName,
      message: message,
    });
  }

  error(message: string): void {
    this.logger.error({
      processType: this.processType,
      loggerName: this.loggerName,
      message: message,
    });
  }

  debug(message: string): void {
    this.logger.debug({
      processType: this.processType,
      loggerName: this.loggerName,
      message: message,
    });
  }

  isDebugEnabled(): boolean {
    return this.debugEnabled === 'DEBUG';
  }
}
