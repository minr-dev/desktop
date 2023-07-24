import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IScheduleEventService } from '@main/services/IScheduleEventService';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';

@injectable()
export class ScheduleEventServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.ScheduleEventService)
    private readonly scheduleEventService: IScheduleEventService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.SCHEDULE_EVENT_LIST, async (_event, start, end) => {
      return await this.scheduleEventService.list(start, end);
    });

    ipcMain.handle(IpcChannel.SCHEDULE_EVENT_GET, async (_event, id) => {
      const scheduleEvent = await this.scheduleEventService.get(id);
      return scheduleEvent;
    });

    ipcMain.handle(
      IpcChannel.SCHEDULE_EVENT_CREATE,
      async (_event, eventType, summary, start, end) => {
        return await this.scheduleEventService.create(eventType, summary, start, end);
      }
    );

    ipcMain.handle(IpcChannel.SCHEDULE_EVENT_SAVE, async (_event, scheduleEvent) => {
      return await this.scheduleEventService.save(scheduleEvent);
    });

    ipcMain.handle(IpcChannel.SCHEDULE_EVENT_DELETE, async (_event, id) => {
      return await this.scheduleEventService.delete(id);
    });
  }
}
