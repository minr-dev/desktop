import { jest } from '@jest/globals';
import { IActivityService } from '@main/services/IActivityService';
import { ActiveWindowLog } from '@shared/dto/ActiveWindowLog';
import { ActivityEvent } from '@shared/dto/ActivityEvent';

export class ActivityServiceMockBuilder {
  private fetchActivities: jest.MockedFunction<
    (start: Date, end: Date) => Promise<ActivityEvent[]>
  > = jest.fn();
  private createActivityEvent: jest.MockedFunction<(winlog: ActiveWindowLog) => ActivityEvent> =
    jest.fn();
  private updateActivityEvent: jest.MockedFunction<
    (activityEvent: ActivityEvent, winlog: ActiveWindowLog) => boolean
  > = jest.fn();
  private getLastActivity: jest.MockedFunction<
    (startDate: Date, endDate: Date) => Promise<ActivityEvent | undefined>
  > = jest.fn();

  constructor() {
    this.fetchActivities.mockResolvedValue([]);
  }

  withFetchActivities(result: ActivityEvent[]): ActivityServiceMockBuilder {
    this.fetchActivities.mockResolvedValue(result);
    return this;
  }

  withCreateActivityEvent(result: ActivityEvent): ActivityServiceMockBuilder {
    this.createActivityEvent.mockReturnValue(result);
    return this;
  }

  withUpdateActivityEvent(result: boolean): ActivityServiceMockBuilder {
    this.updateActivityEvent.mockReturnValue(result);
    return this;
  }

  withGetLastActivity(result: ActivityEvent | undefined): ActivityServiceMockBuilder {
    this.getLastActivity.mockResolvedValue(result);
    return this;
  }

  build(): IActivityService {
    const mock: IActivityService = {
      fetchActivities: this.fetchActivities,
      createActivityEvent: this.createActivityEvent,
      updateActivityEvent: this.updateActivityEvent,
      getLastActivity: this.getLastActivity,
    };
    return mock;
  }
}
