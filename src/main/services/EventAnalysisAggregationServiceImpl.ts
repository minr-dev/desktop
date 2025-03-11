import { inject, injectable } from 'inversify';
import { IEventAnalysisAggregationService } from './IEventAnalysisAggregationService';
import { TYPES } from '@main/types';
import type { IEventEntrySearchService } from './IEventEntrySearchService';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';

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
  ): Promise<EventAggregationTime[]> {
    const eventEntrySearchs = await this.eventEntrySearchService.searchLabelAssociatedEvent(
      startDate,
      endDate,
      eventType
    );
    const eventDataArray = new Map<string, EventAggregationTime>();
    for (const event of eventEntrySearchs) {
      if (!event.start.dateTime || !event.end.dateTime || !event.labelNames) continue;
      const start = event.start.dateTime > startDate ? event.start.dateTime : startDate;
      const end = event.end.dateTime < endDate ? event.end.dateTime : endDate;
      const aggregationTime = end.getTime() - start.getTime();
      for (const labelData of event.labelNames) {
        const analysisData = eventDataArray.get(labelData);
        if (!analysisData) {
          eventDataArray.set(labelData, {
            name: labelData,
            aggregationTime: aggregationTime,
          });
        } else {
          analysisData.aggregationTime += aggregationTime;
        }
      }
    }
    return Array.from(eventDataArray.values()).sort((e1, e2) => {
      return e2.aggregationTime - e1.aggregationTime;
    });
  }
}
