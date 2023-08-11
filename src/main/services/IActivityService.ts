import { WindowLog } from '@shared/dto/WindowLog';
import { ActivityEvent } from '@shared/dto/ActivityEvent';

export interface IActivityService {
  fetchActivities(startDate: Date, endDate: Date): Promise<ActivityEvent[]>;
  createActivityEvent(winlog: WindowLog): Promise<ActivityEvent>;
  updateActivityEvent(activityEvent: ActivityEvent, winlog: WindowLog): boolean;
  getLastActivity(startDate: Date, endDate: Date): Promise<ActivityEvent | undefined>;
}
