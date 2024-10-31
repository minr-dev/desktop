import type { ILogger, PROCESS_TYPE } from '@main/services/ILogger';
import { app } from 'electron';
import { injectable } from 'inversify';
import path from 'path';
import { format } from 'util';
import winston from 'winston';
import 'winston-daily-rotate-file';

@injectable()
export class WinstonLoggerImpl implements ILogger {
  private logger;
  private processType = '';
  private loggerName = '';

  constructor() {
    let logFilePath: string;
    try {
      const userDataPath = app.getPath('userData');
      const baseDir = app.isPackaged ? 'log' : 'log-dev';
      logFilePath = path.join(userDataPath, baseDir);
    } catch (error) {
      console.log('logFilePath create failed:', error);
      logFilePath = './log';
    }
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
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
