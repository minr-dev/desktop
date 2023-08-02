import { jest } from '@jest/globals';
import { IActivityService } from '@renderer/services/IActivityService';
import { ActivityEvent } from '@shared/dto/ActivityEvent';

export class ActivityServiceMockBuilder {
  private fetchActivities: jest.MockedFunction<
    (start: Date, end: Date) => Promise<ActivityEvent[]>
  > = jest.fn();

  constructor() {
    this.fetchActivities.mockResolvedValue([]);
  }

  withFetchActivities(result: ActivityEvent[]): ActivityServiceMockBuilder {
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
