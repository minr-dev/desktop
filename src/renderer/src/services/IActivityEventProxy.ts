import { ActivityEvent } from '@shared/dto/ActivityEvent';

export interface IActivityEventProxy {
  list(start: Date, end: Date): Promise<ActivityEvent[]>;
}
