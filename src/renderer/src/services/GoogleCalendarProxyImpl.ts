import { IpcChannel } from '@shared/constants';
import { ICalendarProxy } from './ICalendarProxy';
import { Calendar } from '@shared/dto/Calendar';
import { injectable } from 'inversify';

@injectable()
export class GoogleCalendarProxyImpl implements ICalendarProxy {
  async get(id: string): Promise<Calendar | undefined> {
    console.log('get');
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_CALENDAR_GET, id);
  }

  async list(): Promise<Calendar[]> {
    console.log('list');
    return await window.electron.ipcRenderer.invoke(IpcChannel.GOOGLE_CALENDAR_LIST);
  }
}
