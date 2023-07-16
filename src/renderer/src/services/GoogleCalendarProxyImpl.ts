import { IpcChannel } from '@shared/constants';
import { IGoogleCalendarProxyImpl } from './IGoogleCalendarProxyImpl';
import { Calendar } from '@shared/dto/Calendar';

export class GoogleCalendarProxyImpl implements IGoogleCalendarProxyImpl {
  async get(id: string): Promise<Calendar | undefined> {
    console.log('get');
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_CALENDAR_GET, id);
  }

  async list(): Promise<Calendar[]> {
    console.log('list');
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_CALENDAR_LIST);
  }
}
