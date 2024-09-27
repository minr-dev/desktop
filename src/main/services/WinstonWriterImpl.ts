import { WinstonLogMessage } from '@shared/data/WinstonLogMessage';
import type { ILogger } from '@shared/utils/ILogger';
import { app } from 'electron';
import { injectable } from 'inversify';
import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

@injectable()
export class WinstonWriterImpl implements ILogger<WinstonLogMessage> {
  private logger;

  constructor() {
    const userDataPath = app.getPath('userData');
    const baseDir = app.isPackaged ? 'log' : 'log-dev';
    const logFilePath = path.join(userDataPath, baseDir);
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

  info(logData: WinstonLogMessage): void {
    this.logger.info({
      processType: logData.processType,
      loggerName: logData.loggerName,
      message: logData.message,
    });
  }

  warn(logData: WinstonLogMessage): void {
    this.logger.warn({
      processType: logData.processType,
      loggerName: logData.loggerName,
      message: logData.message,
    });
  }

  error(logData: WinstonLogMessage): void {
    this.logger.error({
      processType: logData.processType,
      loggerName: logData.loggerName,
      message: logData.message,
    });
  }

  debug(logData: WinstonLogMessage): void {
    this.logger.debug({
      processType: logData.processType,
      loggerName: logData.loggerName,
      message: logData.message,
    });
  }

  isDebugEnabled(): boolean {
    return process.env.IS_DEBUG_ENABLED === 'true';
  }
}
