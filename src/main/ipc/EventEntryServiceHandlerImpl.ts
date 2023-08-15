import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IEventEntryService } from '@main/services/IEventEntryService';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import { EventEntryFactory } from '@main/services/EventEntryFactory';
import { EVENT_TYPE, EventEntry } from '@shared/dto/EventEntry';
import { EventDateTime } from '@shared/dto/EventDateTime';

@injectable()
export class EventEntryServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService
  ) {}

  init(): void {
    ipcMain.handle(
      IpcChannel.EVENT_ENTRY_LIST,
      async (_event, userId: string, start: Date, end: Date) => {
        return await this.eventEntryService.list(userId, start, end);
      }
    );

    ipcMain.handle(IpcChannel.EVENT_ENTRY_GET, async (_event, id) => {
      const eventEntry = await this.eventEntryService.get(id);
      return eventEntry;
    });

    ipcMain.handle(
      IpcChannel.EVENT_ENTRY_CREATE,
      async (
        _event,
        userId: string,
        eventType: EVENT_TYPE,
        summary: string,
        start: EventDateTime,
        end: EventDateTime
      ) => {
        const data = EventEntryFactory.create({
          userId: userId,
          eventType: eventType,
          summary: summary,
          start: start,
          end: end,
        });
        return Promise.resolve(data);
      }
    );

    ipcMain.handle(IpcChannel.EVENT_ENTRY_SAVE, async (_event, eventEntry: EventEntry) => {
      return await this.eventEntryService.save(eventEntry);
    });

    ipcMain.handle(IpcChannel.EVENT_ENTRY_DELETE, async (_event, id: string) => {
      return await this.eventEntryService.delete(id);
    });
  }
}
