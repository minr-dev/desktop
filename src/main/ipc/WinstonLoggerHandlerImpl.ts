import { TYPES } from '@main/types';
import { IpcChannel } from '@shared/constants';
import { WinstonLogMessage } from '@shared/data/WinstonLogMessage';
import type { ILogger } from '@shared/utils/ILogger';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';

@injectable()
export class WinstonLoggerHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.WinstonWriter)
    private readonly winstonLogger: ILogger<WinstonLogMessage>
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.WINSTON_LOGGER_INFO, async (_event, logData: WinstonLogMessage) => {
      return this.winstonLogger.info(logData);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_WARN, async (_event, logData: WinstonLogMessage) => {
      return this.winstonLogger.warn(logData);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_ERROR, async (_event, logData: WinstonLogMessage) => {
      return this.winstonLogger.error(logData);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_DEBUG, async (_event, logData: WinstonLogMessage) => {
      return this.winstonLogger.debug(logData);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_ISDEBUGENABLED, async () => {
      return this.winstonLogger.isDebugEnabled();
    });
  }
}
