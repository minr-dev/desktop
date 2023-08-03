import { ActiveWindowLog } from '@shared/dto/ActiveWindowLog';
import { ActivityEvent } from '@shared/dto/ActivityEvent';

export interface IActivityService {
  fetchActivities(startDate: Date, endDate: Date): Promise<ActivityEvent[]>;
  createActivityEvent(winlog: ActiveWindowLog): ActivityEvent;
  updateActivityEvent(activityEvent: ActivityEvent, winlog: ActiveWindowLog): boolean;
  getLastActivity(startDate: Date, endDate: Date): Promise<ActivityEvent | undefined>;
}
