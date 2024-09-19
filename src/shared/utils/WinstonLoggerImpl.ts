import { injectable } from 'inversify';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { ILogger } from './ILogger';

@injectable()
export class WinstonLoggerImpl implements ILogger {
  private logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss Z' }),
      winston.format.printf(({ level, message, timestamp, processtype, loggername }) => {
        return `${timestamp} [${level}]<${processtype}><${loggername}>: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console(),
    ],
  });

  /**
   * ログファイルの出力先設定
   * 
   * ログファイルを日単位で出力するための設定を行う。
   * 
   * want:
   * mainのユーザーデータパスをこのクラスで取得できなかったため仕方なく作成しました。
   * ユーザーデータパスをこのコード内で取得し、他トランスポートの設定と統一したいと考えています。
   * 
   * @param {string} filePath - ログファイルの出力先パス
   */
  addFileTransport(filePath: string): void {
    const existingTransport = this.logger.transports.find((transport) => {
      return (
        transport instanceof winston.transports.DailyRotateFile && transport.dirname === filePath
      );
    });

    if (!existingTransport) {
      this.logger.add(
        new winston.transports.DailyRotateFile({
          filename: '%DATE%.log',
          dirname: filePath,
          datePattern: 'YYYYMMDD',
          zippedArchive: true,
          maxFiles: '30d',
        })
      );
    }
  }

  /**
   * infoのログ出力
   * 
   * @param {string} message - ログメッセージ
   * @param {string} processtype - プロセスの種類(main or renderer)
   * @param {string} loggername - ロガー名
   */
  info(message: string, processtype: string, loggername: string): void {
    this.logger.info(message, { processtype: processtype, loggername: loggername });
  }

  /**
   * warnのログ出力
   * 
   * @param {string} message - ログメッセージ
   * @param {string} processtype - プロセスの種類(main or renderer)
   * @param {string} loggername - ロガー名
   */
  warn(message: string, processtype: string, loggername: string): void {
    this.logger.warn(message, { processtype: processtype, loggername: loggername });
  }

  /**
   * errorのログ出力
   * 
   * @param {string} message - ログメッセージ
   * @param {string} processtype - プロセスの種類(main or renderer)
   * @param {string} loggername - ロガー名
   */
  error(message: string, processtype: string, loggername: string): void {
    this.logger.error(message, { processtype: processtype, loggername: loggername });
  }

  /**
   * debugのログ出力
   * 
   * @param {string} message - ログメッセージ
   * @param {string} processtype - プロセスの種類(main or renderer)
   * @param {string} loggername - ロガー名
   */
  debug(message: string, processtype: string, loggername: string): void {
    this.logger.debug(message, { processtype: processtype, loggername: loggername });
  }

  /**
   * デバッグモードの有効判定
   * 
   * @returns {boolean}
   */
  isDebugEnabled(): boolean {
    return process.env.IS_DEBUG_ENABLED === 'true';
  }
}
