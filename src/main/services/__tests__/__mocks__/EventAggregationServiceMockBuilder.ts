import { jest } from '@jest/globals';
import {
  EventAggregationParams,
  IEventAggregationService,
} from '@main/services/IEventAggregationService';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export class EventAggregationServiceMockBuilder {
  private aggregatePlannedTimeByTasks: jest.MockedFunction<
    (taskIds: string[]) => Promise<Map<string, number>>
  > = jest.fn();
  private aggregateByProject: jest.MockedFunction<
    (startDate: Date, endDate: Date, eventType: EVENT_TYPE) => Promise<Map<string, number>>
  > = jest.fn();
  private aggregateByCategory: jest.MockedFunction<
    (startDate: Date, endDate: Date, eventType: EVENT_TYPE) => Promise<Map<string, number>>
  > = jest.fn();
  private aggregateByTask: jest.MockedFunction<
    (params: EventAggregationParams) => Promise<Map<string, number>>
  > = jest.fn();
  private aggregateByLabel: jest.MockedFunction<
    (startDate: Date, endDate: Date, eventType: EVENT_TYPE) => Promise<Map<string, number>>
  > = jest.fn();

  build(): IEventAggregationService {
    const mock: IEventAggregationService = {
      aggregatePlannedTimeByTasks: this.aggregatePlannedTimeByTasks,
      aggregateByProject: this.aggregateByProject,
      aggregateByCategory: this.aggregateByCategory,
      aggregateByTask: this.aggregateByTask,
      aggregateByLabel: this.aggregateByLabel,
    };
    return mock;
  }
}
