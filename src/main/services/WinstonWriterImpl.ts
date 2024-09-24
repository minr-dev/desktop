import type { ILogger } from '@shared/utils/ILogger';
import { app } from 'electron';
import { injectable } from 'inversify';
import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

@injectable()
export class WinstonWriterImpl implements ILogger {
  private logger;

  constructor() {
    const userDataPath = app.getPath('userData');
    const baseDir = app.isPackaged ? 'log' : 'log-dev';
    const logFilePath = path.join(userDataPath, baseDir);
    this.logger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss Z' }),
        winston.format.printf(({ timestamp, message }) => {
          return `${timestamp} ${message}`;
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

  info(message: string): void {
    this.logger.info(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }

  isDebugEnabled(): boolean {
    return process.env.IS_DEBUG_ENABLED === 'true';
  }
}
