import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IEventEntryService } from '@main/services/IEventEntryService';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import { EventEntryFactory } from '@main/services/EventEntryFactory';

@injectable()
export class EventEntryServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.EVENT_ENTRY_LIST, async (_event, start, end) => {
      return await this.eventEntryService.list(start, end);
    });

    ipcMain.handle(IpcChannel.EVENT_ENTRY_GET, async (_event, id) => {
      const eventEntry = await this.eventEntryService.get(id);
      return eventEntry;
    });

    ipcMain.handle(
      IpcChannel.EVENT_ENTRY_CREATE,
      async (_event, eventType, summary, start, end) => {
        const data = EventEntryFactory.create({
          eventType: eventType,
          summary: summary,
          start: start,
          end: end,
        });
        return Promise.resolve(data);
      }
    );

    ipcMain.handle(IpcChannel.EVENT_ENTRY_SAVE, async (_event, eventEntry) => {
      return await this.eventEntryService.save(eventEntry);
    });

    ipcMain.handle(IpcChannel.EVENT_ENTRY_DELETE, async (_event, id) => {
      return await this.eventEntryService.delete(id);
    });
  }
}
