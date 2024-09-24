import { inject, injectable } from 'inversify';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import type { ILogger } from '@shared/utils/ILogger';
import { ipcMain } from 'electron';
import { IpcChannel } from '@shared/constants';

@injectable()
export class WinstonLoggerHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.WinstonWriter)
    private readonly winstonLogger: ILogger
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.WINSTON_LOGGER_INFO, async (_event, message: string) => {
      return this.winstonLogger.info(message);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_WARN, async (_event, message: string) => {
      return this.winstonLogger.warn(message);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_ERROR, async (_event, message: string) => {
      return this.winstonLogger.error(message);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_DEBUG, async (_event, message: string) => {
      return this.winstonLogger.debug(message);
    });

    ipcMain.handle(IpcChannel.WINSTON_LOGGER_ISDEBUGENABLED, async () => {
      return this.winstonLogger.isDebugEnabled();
    });
  }
}
