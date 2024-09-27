import type { IWinstonLogger, WinstonSetting } from '@shared/utils/IWinstonLogger';
import { app } from 'electron';
import { injectable } from 'inversify';
import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

@injectable()
export class WinstonLoggerImpl implements IWinstonLogger {
  private logger;
  private loggerSetting: WinstonSetting;

  constructor() {
    const userDataPath = app.getPath('userData');
    const baseDir = app.isPackaged ? 'log' : 'log-dev';
    const logFilePath = path.join(userDataPath, baseDir);
    this.loggerSetting = {
      processType: 'undefined',
      loggerName: 'undefined',
    }
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
    this.loggerSetting.loggerName = loggerName;
  }

  setProcessType(processType: string): void {
    this.loggerSetting.processType = processType;
  }

  info(message: string): void {
    this.logger.info({
      processType: this.loggerSetting.processType,
      loggerName: this.loggerSetting.loggerName,
      message: message,
    });
  }

  warn(message: string): void {
    this.logger.warn({
      processType: this.loggerSetting.processType,
      loggerName: this.loggerSetting.loggerName,
      message: message,
    });
  }

  error(message: string): void {
    this.logger.error({
      processType: this.loggerSetting.processType,
      loggerName: this.loggerSetting.loggerName,
      message: message,
    });
  }

  debug(message: string): void {
    this.logger.debug({
      processType: this.loggerSetting.processType,
      loggerName: this.loggerSetting.loggerName,
      message: message,
    });
  }

  isDebugEnabled(): boolean {
    return process.env.IS_DEBUG_ENABLED === 'true';
  }
}
