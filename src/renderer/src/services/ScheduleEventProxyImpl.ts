import { IpcChannel } from '@shared/constants';
import { EVENT_TYPE, ScheduleEvent } from '@shared/dto/ScheduleEvent';
import { injectable } from 'inversify';
import { IScheduleEventProxy } from './IScheduleEventProxy';

@injectable()
export class ScheduleEventProxyImpl implements IScheduleEventProxy {
  async list(start: Date, end: Date): Promise<ScheduleEvent[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.SCHEDULE_EVENT_LIST,
      start,
      end
    );
    console.log('ScheduleEventProxyImpl', 'start-end', start, end, data);
    return data;
  }

  async get(id: string): Promise<ScheduleEvent | undefined> {
    const data = await window.electron.ipcRenderer.invoke(IpcChannel.SCHEDULE_EVENT_GET, id);
    return data;
  }

  async create(
    eventType: EVENT_TYPE,
    summary: string,
    start: Date,
    end: Date
  ): Promise<ScheduleEvent> {
    return await window.electron.ipcRenderer.invoke(
      IpcChannel.SCHEDULE_EVENT_CREATE,
      eventType,
      summary,
      start,
      end
    );
  }

  async save(ScheduleEvent: ScheduleEvent): Promise<ScheduleEvent> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.SCHEDULE_EVENT_SAVE, ScheduleEvent);
  }

  async delete(id: string): Promise<void> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.SCHEDULE_EVENT_DELETE, id);
  }
}
