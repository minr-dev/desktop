import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export interface IEventAggregationService {
  aggregatePlannedTimeByTasks(userId: string, taskIds: string[]): Promise<Map<string, number>>;
  aggregateByProject(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]>;
  aggregateByCategory(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]>;
  aggregateByTask(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]>;
  aggregateByLabel(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]>;
}
