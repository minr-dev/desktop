import { inject, injectable } from 'inversify';
import { IEventAnalysisAggregationService } from './IEventAnalysisAggregationService';
import { TYPES } from '@main/types';
import type { IEventEntrySearchService } from './IEventEntrySearchService';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { BusinessClassificationUsage } from '@shared/data/BusinessClassificationUsage';

/**
 * イベントの分析と分類を行うクラス
 *
 * TODO: EventAggregationServiceと将来的に統合する
 */
@injectable()
export class EventAnalysisAggregationServiceImpl implements IEventAnalysisAggregationService {
  constructor(
    @inject(TYPES.EventEntrySearchService)
    private readonly eventEntrySearchService: IEventEntrySearchService
  ) {}
  async aggregateLabel(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<BusinessClassificationUsage[]> {
    const eventEntrySearchs = await this.eventEntrySearchService.searchLabelAssociatedEvent(
      startDate,
      endDate,
      eventType
    );
    const eventDataArray = new Map<string, BusinessClassificationUsage>();
    for (const event of eventEntrySearchs) {
      if (!event.start.dateTime || !event.end.dateTime || !event.labelNames) continue;
      const start = event.start.dateTime > startDate ? event.start.dateTime : startDate;
      const end = event.end.dateTime < endDate ? event.end.dateTime : endDate;
      const usageTime = end.getTime() - start.getTime();
      for (const labelData of event.labelNames) {
        const usageData = eventDataArray.get(labelData);
        if (!usageData) {
          eventDataArray.set(labelData, {
            basename: labelData,
            usageTime: usageTime,
          });
        } else {
          usageData.usageTime += usageTime;
        }
      }
    }
    return Array.from(eventDataArray.values()).sort((e1, e2) => {
      return e2.usageTime - e1.usageTime;
    });
  }
}
