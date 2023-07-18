import { IpcChannel } from '@shared/constants';
import { IpcMainInvokeEvent, ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IGoogleCalendarService } from '@main/services/IGoogleCalendarService';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';

@injectable()
export class GoogleCalendarServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.GoogleCalendarService)
    private readonly googleCalendarService: IGoogleCalendarService
  ) {}

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(
      IpcChannel.GOOGLE_CALENDAR_GET,
      async (_event: IpcMainInvokeEvent, id: string) => {
        console.log(`ipcMain handle ${IpcChannel.GOOGLE_CALENDAR_GET}`);
        return await this.googleCalendarService.get(id);
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.GOOGLE_CALENDAR_LIST, async (_event: IpcMainInvokeEvent) => {
      console.log(`ipcMain handle ${IpcChannel.GOOGLE_CALENDAR_LIST}`);
      return await this.googleCalendarService.list();
    });
  }
}
