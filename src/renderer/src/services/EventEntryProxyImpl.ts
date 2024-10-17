import { IpcChannel } from '@shared/constants';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { injectable } from 'inversify';
import { IEventEntryProxy } from './IEventEntryProxy';
import { EventDateTime } from '@shared/data/EventDateTime';
import { getLogger } from '@renderer/utils/LoggerUtil';

@injectable()
export class EventEntryProxyImpl implements IEventEntryProxy {
  private logger = getLogger('EventEntryProxyImpl');

  async list(userId: string, start: Date, end: Date): Promise<EventEntry[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.EVENT_ENTRY_LIST,
      userId,
      start,
      end
    );
    if (this.logger.isDebugEnabled())
      this.logger.debug('EventEntryProxyImpl', 'start-end', userId, start, end, data);
    return data;
  }

  async get(id: string): Promise<EventEntry | undefined> {
    const data = await window.electron.ipcRenderer.invoke(IpcChannel.EVENT_ENTRY_GET, id);
    return data;
  }

  async create(
    userId: string,
    eventType: EVENT_TYPE,
    summary: string,
    start: EventDateTime,
    end: EventDateTime,
    isProvisional?: boolean
  ): Promise<EventEntry> {
    return await window.electron.ipcRenderer.invoke(
      IpcChannel.EVENT_ENTRY_CREATE,
      userId,
      eventType,
      summary,
      start,
      end,
      isProvisional
    );
  }

  async save(eventEntry: EventEntry): Promise<EventEntry> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.EVENT_ENTRY_SAVE, eventEntry);
  }

  async delete(id: string): Promise<void> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.EVENT_ENTRY_DELETE, id);
  }
}
