import { jest } from '@jest/globals';
import { ProcessedEvent } from '@aldabil/react-scheduler/types';
import { IActivityService } from '@renderer/services/IActivityService';

export class ActivityServiceMockBuilder {
  private fetchActivities: jest.MockedFunction<
    (start: Date, end: Date) => Promise<ProcessedEvent[]>
  > = jest.fn();

  constructor() {
    this.fetchActivities.mockResolvedValue([]);
  }

  withFetchActivities(result: ProcessedEvent[]): ActivityServiceMockBuilder {
    this.fetchActivities.mockResolvedValue(result);
    return this;
  }

  build(): IActivityService {
    const mock: IActivityService = {
      fetchActivities: this.fetchActivities,
    };
    return mock;
  }
}
