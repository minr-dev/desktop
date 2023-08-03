import { IpcChannel } from '@shared/constants';
import { injectable } from 'inversify';
import { IActivityEventProxy } from './IActivityEventProxy';
import { ActivityEvent } from '@shared/dto/ActivityEvent';

@injectable()
export class ActivityEventProxyImpl implements IActivityEventProxy {
  async list(start: Date, end: Date): Promise<ActivityEvent[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.ACTIVITY_EVENT_LIST,
      start,
      end
    );
    console.log('ActivityEventProxyImpl', 'start-end', start, end, data);
    return data;
  }
}
