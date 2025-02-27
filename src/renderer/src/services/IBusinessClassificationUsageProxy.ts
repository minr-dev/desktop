import { BusinessClassificationUsage } from '@shared/data/BusinessClassificationUsage';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export interface IBusinessClassificationUsageProxy {
  get(start: Date, end: Date, eventType: EVENT_TYPE): Promise<BusinessClassificationUsage[]>;
}
