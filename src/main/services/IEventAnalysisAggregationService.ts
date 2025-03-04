import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export interface IEventAnalysisAggregationService {
  aggregateLabel(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]>;
}
