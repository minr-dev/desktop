import { injectable } from 'inversify';
import { IBusinessClassificationUsageProxy } from './IBusinessClassificationUsageProxy';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { BusinessClassificationUsage } from '@shared/data/BusinessClassificationUsage';
import { IpcChannel } from '@shared/constants';

@injectable()
export class BusinessClassificationUsageProxyImpl implements IBusinessClassificationUsageProxy {
  async get(start: Date, end: Date, eventType: EVENT_TYPE): Promise<BusinessClassificationUsage[]> {
    const data = await window.electron.ipcRenderer.invoke(
      IpcChannel.BUSINESS_CLASSIFICATION_USAGE_LIST,
      start,
      end,
      eventType
    );
    return data;
  }
}
