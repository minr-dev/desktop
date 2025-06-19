import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export interface EventAggregationParams {
  start?: Date;
  end?: Date;
  eventType: EVENT_TYPE;
}

export interface IEventAggregationProxy {
  getAggregationByProject(params: EventAggregationParams): Promise<EventAggregationTime[]>;
  getAggregationByCategory(params: EventAggregationParams): Promise<EventAggregationTime[]>;
  getAggregationByTask(params: EventAggregationParams): Promise<EventAggregationTime[]>;
  getAggregationByLabel(params: EventAggregationParams): Promise<EventAggregationTime[]>;
}
