import type { ILogger } from '@main/services/ILogger';
import { app } from 'electron';
import { injectable } from 'inversify';
import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

@injectable()
export class WinstonLoggerImpl implements ILogger {
  private logger;
  private processType = '';
  private loggerName = '';
  private debugEnabled = '';

  constructor() {
    const userDataPath = app.getPath('userData');
    const baseDir = app.isPackaged ? 'log' : 'log-dev';
    const logFilePath = path.join(userDataPath, baseDir);
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
