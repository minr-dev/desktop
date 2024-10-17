import { IpcChannel } from '@shared/constants';
import { LogMessage } from '@shared/data/LogMessage';
import { ipcMain } from 'electron';
import { injectable } from 'inversify';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { getLogger } from '@main/utils/LoggerUtil';

@injectable()
export class LoggerHandlerImpl implements IIpcHandlerInitializer {
  init(): void {
    ipcMain.handle(IpcChannel.LOGGER_INFO, async (_event, logData: LogMessage) => {
      const logger = getLogger(logData.loggerName);
      logger.setProcessType('renderer');
      return logger.info(logData.message, ...logData.meta);
    });

    ipcMain.handle(IpcChannel.LOGGER_WARN, async (_event, logData: LogMessage) => {
      const logger = getLogger(logData.loggerName);
      logger.setProcessType('renderer');
      return logger.warn(logData.message, ...logData.meta);
    });

    ipcMain.handle(IpcChannel.LOGGER_ERROR, async (_event, logData: LogMessage) => {
      const logger = getLogger(logData.loggerName);
      logger.setProcessType('renderer');
      return logger.error(logData.message, ...logData.meta);
    });

    ipcMain.handle(IpcChannel.LOGGER_DEBUG, async (_event, logData: LogMessage) => {
      const logger = getLogger(logData.loggerName);
      logger.setProcessType('renderer');
      return logger.debug(logData.message, ...logData.meta);
    });

    ipcMain.handle(IpcChannel.LOGGER_ISDEBUGENABLED, async () => {
      const logger = getLogger('');
      return logger.isDebugEnabled();
    });
  }
}
