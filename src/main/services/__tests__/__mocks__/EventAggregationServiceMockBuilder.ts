import { jest } from '@jest/globals';
import { IEventAggregationService } from '@main/services/IEventAggregationService';

export class EventAggregationServiceMockBuilder {
  private getPlannedTimeByTasks: jest.MockedFunction<
    (userId: string, taskIds: string[]) => Promise<Map<string, number>>
  > = jest.fn();

  build(): IEventAggregationService {
    const mock: IEventAggregationService = {
      getPlannedTimeByTasks: this.getPlannedTimeByTasks,
    };
    return mock;
  }
}
