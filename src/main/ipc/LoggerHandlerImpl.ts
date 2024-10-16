import { IpcChannel } from '@shared/constants';
import { LogMessage } from '@shared/data/LogMessage';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { ILoggerFactory } from '@main/services/ILoggerFactory';

@injectable()
export class LoggerHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject('LoggerFactory')
    private readonly loggerFactory: ILoggerFactory
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.WINSTON_LOGGER_INFO, async (_event, logData: LogMessage) => {
      const logger = this.loggerFactory.getLogger(logData.loggerName);
      logger.setProcessType('renderer');
      return logger.info(logData.message, ...logData.meta);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_WARN, async (_event, logData: LogMessage) => {
      const logger = this.loggerFactory.getLogger(logData.loggerName);
      logger.setProcessType('renderer');
      return logger.warn(logData.message, ...logData.meta);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_ERROR, async (_event, logData: LogMessage) => {
      const logger = this.loggerFactory.getLogger(logData.loggerName);
      logger.setProcessType('renderer');
      return logger.error(logData.message, ...logData.meta);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_DEBUG, async (_event, logData: LogMessage) => {
      const logger = this.loggerFactory.getLogger(logData.loggerName);
      logger.setProcessType('renderer');
      return logger.debug(logData.message, ...logData.meta);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_ISDEBUGENABLED, async () => {
      const logger = this.loggerFactory.getLogger('');
      return logger.isDebugEnabled();
    });
  }
}
