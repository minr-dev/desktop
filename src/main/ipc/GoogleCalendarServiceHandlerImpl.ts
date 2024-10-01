import { IpcChannel } from '@shared/constants';
import { IpcMainInvokeEvent, ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IExternalCalendarService } from '@main/services/IExternalCalendarService';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import type { ILoggerFactory } from '@main/services/ILoggerFactory';

@injectable()
export class GoogleCalendarServiceHandlerImpl implements IIpcHandlerInitializer {
  private logger;

  constructor(
    @inject(TYPES.GoogleCalendarService)
    private readonly externalCalendarService: IExternalCalendarService,
    @inject(TYPES.LoggerFactory)
    private readonly loggerFactory: ILoggerFactory
  ) {
    this.logger = this.loggerFactory.getLogger({
      processType: 'main',
      loggerName: 'GoogleCalendarServiceHandlerImpl',
    });
  }

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.CALENDAR_GET, async (_event: IpcMainInvokeEvent, id: string) => {
      this.logger.info(`ipcMain handle ${IpcChannel.CALENDAR_GET}`);
      return await this.externalCalendarService.get(id);
    });
  }
}
