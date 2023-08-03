import { IpcChannel } from '@shared/constants';
import { EVENT_TYPE, EventEntry } from '@shared/dto/EventEntry';
import { injectable } from 'inversify';
import { IEventEntryProxy } from './IEventEntryProxy';

@injectable()
export class EventEntryProxyImpl implements IEventEntryProxy {
  async list(start: Date, end: Date): Promise<EventEntry[]> {
    const data = await window.electron.ipcRenderer.invoke(IpcChannel.EVENT_ENTRY_LIST, start, end);
    console.log('EventEntryProxyImpl', 'start-end', start, end, data);
    return data;
  }

  async get(id: string): Promise<EventEntry | undefined> {
    const data = await window.electron.ipcRenderer.invoke(IpcChannel.EVENT_ENTRY_GET, id);
    return data;
  }

  async create(
    eventType: EVENT_TYPE,
    summary: string,
    start: Date,
    end: Date
  ): Promise<EventEntry> {
    return await window.electron.ipcRenderer.invoke(
      IpcChannel.EVENT_ENTRY_CREATE,
      eventType,
      summary,
      start,
      end
    );
  }

  async save(eventEntry: EventEntry): Promise<EventEntry> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.EVENT_ENTRY_SAVE, eventEntry);
  }

  async delete(id: string): Promise<void> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.EVENT_ENTRY_DELETE, id);
  }
}
