import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import type { ITaskProcessor } from '@main/services/ITaskProcessor';

@injectable()
export class CalendarSynchronizerHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.CalendarSyncProcessor)
    private readonly calendarSynchronizer: ITaskProcessor
  ) {}

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.CALENDAR_SYNC, async (_event) => {
      return await this.calendarSynchronizer.execute();
    });
  }
}
