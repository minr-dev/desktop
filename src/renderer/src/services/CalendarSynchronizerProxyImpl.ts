import { IpcChannel } from '@shared/constants';
import { injectable } from 'inversify';
import { ISynchronizerProxy } from './ISynchronizerProxy';

@injectable()
export class CalendarSynchronizerProxyImpl implements ISynchronizerProxy {
  async sync(): Promise<void> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.CALENDAR_SYNC);
  }
}
