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

    /**
     * minrイベントの保存
     *
     * UIからの保存要求で、新規の場合は、まだ外部カレンダーが紐づいていない。
     * 更新の場合で、且つ、すでに、外部カレンダーのイベントと紐づいている場合には、
     * lastSynced を更新して、同期処理の対象となるようにする。
     */
    ipcMain.handle(IpcChannel.EVENT_ENTRY_SAVE, async (_event, eventEntry: EventEntry) => {
      if (eventEntry.externalEventEntryId) {
        eventEntry.lastSynced = new Date();
      }
      return await this.eventEntryService.save(eventEntry);
    });

    /**
     * minrイベントの削除
     *
     * UIからの削除要求で、且つ、すでに、外部カレンダーのイベントと紐づいている場合には、
     * lastSynced を更新して、同期処理の対象となるようにする。
     */
    ipcMain.handle(IpcChannel.EVENT_ENTRY_DELETE, async (_event, id: string) => {
      const eventEntry = await this.eventEntryService.get(id);
      if (eventEntry) {
        eventEntry.deleted = new Date();
        if (eventEntry.externalEventEntryId) {
          eventEntry.lastSynced = eventEntry.deleted;
        }
        await this.eventEntryService.save(eventEntry);
      }
    });
  }
}
