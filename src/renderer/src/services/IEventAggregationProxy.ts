import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export interface EventAggregationParams {
  start?: Date;
  end?: Date;
  eventType: EVENT_TYPE;
}

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
  getAggregationByTask(params: EventAggregationParams): Promise<EventAggregationTime[]>;
  getAggregationByLabel(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]>;
}
