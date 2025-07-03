import { app } from 'electron';
import { injectable } from 'inversify';
import path from 'path';
import { format } from 'util';
import winston from 'winston';
import 'winston-daily-rotate-file';
import type { ILogger, PROCESS_TYPE } from '@main/services/ILogger';

@injectable()
export class WinstonLoggerImpl implements ILogger {
  private processType = '';
  private loggerName = '';
  static logger = ((): winston.Logger => {
    const logFilePath = (): string => {
      const userDataPath = app.getPath('userData');
      const baseDir = app.isPackaged ? 'log' : 'log-dev';
      return path.join(userDataPath, baseDir);
    };
    const logFileTransport = new winston.transports.DailyRotateFile({
      filename: '%DATE%.log',
      dirname: logFilePath(),
      datePattern: 'YYYYMMDD',
      zippedArchive: true,
      maxFiles: '30d',
    });
    const errorLogFileTransport = new winston.transports.DailyRotateFile({
      filename: '%DATE%-error.log',
      dirname: logFilePath(),
      datePattern: 'YYYYMMDD',
      zippedArchive: true,
      maxFiles: '30d',
      level: 'error',
    });
    const logger = winston.createLogger({
      level: process.env.LOG_LEVEL?.toLowerCase() || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss Z' }),
        winston.format.printf(({ timestamp, level, processType, loggerName, message }) => {
          return `${timestamp} [${level}]<${processType}><${loggerName}>: ${message}`;
        })
      ),
      transports: [logFileTransport, errorLogFileTransport],
      // コンソールに出力されている未処理エラーをログファイルに出力するハンドラー
      // ※ 現在はコンソールでのエラー確認で十分なためコメントアウトする。
      // exceptionHandlers: [errorLogFileTransport],
      // rejectionHandlers: [errorLogFileTransport],
    });
    return logger;
  })();

  setName(loggerName: string): void {
    this.loggerName = loggerName;
  }

  setProcessType(processType: PROCESS_TYPE): void {
    this.processType = processType;
  }

  info(message: unknown, ...meta: unknown[]): void {
    WinstonLoggerImpl.logger.info({
      processType: this.processType,
      loggerName: this.loggerName,
      message: format(message, ...meta),
    });
  }

  warn(message: unknown, ...meta: unknown[]): void {
    WinstonLoggerImpl.logger.warn({
      processType: this.processType,
      loggerName: this.loggerName,
      message: format(message, ...meta),
    });
  }

  error(message: unknown, ...meta: unknown[]): void {
    WinstonLoggerImpl.logger.error({
      processType: this.processType,
      loggerName: this.loggerName,
      message: format(message, ...meta),
    });
  }

  debug(message: unknown, ...meta: unknown[]): void {
    WinstonLoggerImpl.logger.debug({
      processType: this.processType,
      loggerName: this.loggerName,
      message: format(message, ...meta),
    });
  }

  isDebugEnabled(): boolean {
    return WinstonLoggerImpl.logger.level === 'debug';
  }
}
