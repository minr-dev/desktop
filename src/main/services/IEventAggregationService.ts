import { EVENT_TYPE } from '@shared/data/EventEntry';

export interface EventAggregationParams {
  startDate?: Date;
  endDate?: Date;
  eventType: EVENT_TYPE;
}

export interface IEventAggregationService {
  aggregatePlannedTimeByTasks(taskIds: string[]): Promise<Map<string, number>>;
  aggregateByProject(params: EventAggregationParams): Promise<Map<string, number>>;
  aggregateByCategory(params: EventAggregationParams): Promise<Map<string, number>>;
  aggregateByTask(params: EventAggregationParams): Promise<Map<string, number>>;
  aggregateByLabel(params: EventAggregationParams): Promise<Map<string, number>>;
}
