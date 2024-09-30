import { TYPES } from '@main/types';
import { IpcChannel } from '@shared/constants';
import { WinstonLogMessage } from '@shared/data/WinstonLogMessage';
import type { IWinstonLogger } from '@main/services/IWinstonLogger';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';

@injectable()
export class WinstonLoggerHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.WinstonLogger)
    private readonly logger: IWinstonLogger
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.WINSTON_LOGGER_INFO, async (_event, logData: WinstonLogMessage) => {
      this.logger.setProcessType(logData.processType);
      this.logger.setName(logData.loggerName);
      return this.logger.info(logData.message);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_WARN, async (_event, logData: WinstonLogMessage) => {
      this.logger.setProcessType(logData.processType);
      this.logger.setName(logData.loggerName);
      return this.logger.warn(logData.message);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_ERROR, async (_event, logData: WinstonLogMessage) => {
      this.logger.setProcessType(logData.processType);
      this.logger.setName(logData.loggerName);
      return this.logger.error(logData.message);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_DEBUG, async (_event, logData: WinstonLogMessage) => {
      this.logger.setProcessType(logData.processType);
      this.logger.setName(logData.loggerName);
      return this.logger.debug(logData.message);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_ISDEBUGENABLED, async () => {
      return this.logger.isDebugEnabled();
    });
  }
}
