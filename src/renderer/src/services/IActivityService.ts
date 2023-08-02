import { ActivityEvent } from '@shared/dto/ActivityEvent';

export interface IActivityService {
  fetchActivities(startDate: Date, endDate: Date): Promise<ActivityEvent[]>;
}
