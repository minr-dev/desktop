import { WindowLog } from '@shared/data/WindowLog';
import { ActivityEvent } from '@shared/data/ActivityEvent';

export interface IActivityService {
  fetchActivities(startDate: Date, endDate: Date): Promise<ActivityEvent[]>;
  createActivityEvent(winlog: WindowLog): Promise<ActivityEvent>;
  updateActivityEvent(activityEvent: ActivityEvent, winlog: WindowLog): boolean;
  getLastActivity(startDate: Date, endDate: Date): Promise<ActivityEvent | undefined>;
}
