import { app } from 'electron';
import { injectable } from 'inversify';
import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { ILoggerInitializer } from '@main/services/ILoggerInitializer';

@injectable()
export class WinstonInitializerImpl implements ILoggerInitializer<winston.Logger> {
  private logger;

  constructor() {
    const logFilePath = (): string => {
      try {
        const userDataPath = app.getPath('userData');
        const baseDir = app.isPackaged ? 'log' : 'log-dev';
        return path.join(userDataPath, baseDir);
      } catch (error) {
        console.log('logFilePath create failed:', error);
        return './log';
      }
    };
    const rotateFileTransport = new winston.transports.DailyRotateFile({
      filename: '%DATE%.log',
      dirname: logFilePath(),
      datePattern: 'YYYYMMDD',
      zippedArchive: true,
      maxFiles: '30d',
    });

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL?.toLowerCase() || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss Z' }),
        winston.format.printf(({ timestamp, level, processType, loggerName, message }) => {
          return `${timestamp} [${level}]<${processType}><${loggerName}>: ${message}`;
        })
      ),
      transports: [rotateFileTransport],
      exceptionHandlers: [rotateFileTransport],
    });
  }

  getLogger(): winston.Logger {
    return this.logger;
  }
}
