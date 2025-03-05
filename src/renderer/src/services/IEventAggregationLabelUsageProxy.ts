import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export interface IEventAggregationLabelUsageProxy {
  get(start: Date, end: Date, eventType: EVENT_TYPE): Promise<EventAggregationTime[]>;
}
