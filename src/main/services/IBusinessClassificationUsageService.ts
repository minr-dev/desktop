import { BusinessClassificationUsage } from '@shared/data/BusinessClassificationUsage';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export interface IBusinessClassificationUsageService {
  get(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<BusinessClassificationUsage[]>;
}
