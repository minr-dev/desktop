import { IpcChannel } from '@shared/constants';
import { injectable } from 'inversify';
import { IActivityUsageProxy } from './IActivityUsageProxy';
import { ActivityUsage } from '@shared/data/ActivityUsage';

@injectable()
export class ActivityUsageProxyImpl implements IActivityUsageProxy {
  async get(start: Date, end: Date): Promise<ActivityUsage[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.ACTIVITY_USAGE_LIST,
      start,
      end
    );
    return data;
  }
}
