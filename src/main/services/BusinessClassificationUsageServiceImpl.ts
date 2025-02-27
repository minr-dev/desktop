import { inject, injectable } from 'inversify';
import { IBusinessClassificationUsageService } from './IBusinessClassificationUsageService';
import { TYPES } from '@main/types';
import type { IEventEntrySearchService } from './IEventEntrySearchService';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { BusinessClassificationUsage } from '@shared/data/BusinessClassificationUsage';

@injectable()
export class BusinessClassificationUsageServiceImpl implements IBusinessClassificationUsageService {
  constructor(
    @inject(TYPES.EventEntrySearchService)
    private readonly eventEntrySearchService: IEventEntrySearchService
  ) {}
  async get(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<BusinessClassificationUsage[]> {
    const eventEntrySearchs = await this.eventEntrySearchService.searchBusinessClassification(
      startDate,
      endDate,
      eventType
    );
    const eventDataArray: BusinessClassificationUsage[] = [];
    for (const event of eventEntrySearchs) {
      if (!event.start.date || !event.end.date || !event.labelNames) continue;
      const start = event.start > startDate ? event.start.date : startDate;
      const end = event.end < endDate ? event.end.date : endDate;
      const usageTime = end.getTime() - start.getTime();
      for (const labelData of event.labelNames) {
        eventDataArray.push({
          basename: labelData,
          usageTime: usageTime,
        });
      }
    }
    return eventDataArray;
  }
}
