import { ActivityEvent } from '@shared/data/ActivityEvent';

export interface IActivityEventProxy {
  list(start: Date, end: Date): Promise<ActivityEvent[]>;
}
