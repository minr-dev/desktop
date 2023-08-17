import { IpcChannel } from '@shared/constants';
import { injectable } from 'inversify';
import { ICalendarSynchronizerProxy } from './ICalendarSynchronizerProxy';

@injectable()
export class CalendarSynchronizerProxyImpl implements ICalendarSynchronizerProxy {
  async sync(): Promise<void> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.CALENDAR_SYNC);
  }
}
