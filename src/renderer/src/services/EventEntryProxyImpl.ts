import { IpcChannel } from '@shared/constants';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { injectable } from 'inversify';
import { IEventEntryProxy } from './IEventEntryProxy';
import { EventDateTime } from '@shared/data/EventDateTime';
import rendererContainer from '../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { TYPES } from '@renderer/types';

@injectable()
export class EventEntryProxyImpl implements IEventEntryProxy {
  async list(userId: string, start: Date, end: Date): Promise<EventEntry[]> {
    const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
    const logger = loggerFactory.getLogger({
      processType: 'renderer',
      loggerName: 'EventEntryProxyImpl',
    });
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.EVENT_ENTRY_LIST,
      userId,
      start,
      end
    );
    if (logger.isDebugEnabled())
      logger.debug(
        `EventEntryProxyImpl: start-end: userId=${userId}, start=${start}, end=${end}, data=${data}`
      );
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
