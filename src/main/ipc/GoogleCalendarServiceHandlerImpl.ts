import { IpcChannel } from '@shared/constants';
import { IpcMainInvokeEvent, ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IExternalCalendarService } from '@main/services/IExternalCalendarService';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';

@injectable()
export class GoogleCalendarServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.GoogleCalendarService)
    private readonly externalCalendarService: IExternalCalendarService
  ) {}

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(
      IpcChannel.GOOGLE_CALENDAR_GET,
      async (_event: IpcMainInvokeEvent, id: string) => {
        console.log(`ipcMain handle ${IpcChannel.GOOGLE_CALENDAR_GET}`);
        return await this.externalCalendarService.get(id);
      }
    );
  }
}
