import { injectable } from 'inversify';
import { IpcChannel } from '@shared/constants';
import { Calendar } from '@shared/data/Calendar';
import { ICalendarProxy } from './ICalendarProxy';

@injectable()
export class GoogleCalendarProxyImpl implements ICalendarProxy {
  async get(id: string): Promise<Calendar | undefined> {
    console.log('get');
    return await window.electron.ipcRenderer.invoke(IpcChannel.CALENDAR_GET, id);
  }
}
