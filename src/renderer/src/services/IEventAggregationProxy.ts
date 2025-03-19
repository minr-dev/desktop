import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export interface IEventAggregationProxy {
  getAggregationByProject(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]>;
  getAggregationByCategory(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]>;
  getAggregationByTask(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]>;
  getAggregationByLabel(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]>;
}
