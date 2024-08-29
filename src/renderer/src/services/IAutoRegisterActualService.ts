import { ActivityEvent } from '@shared/data/ActivityEvent';
import { EventEntry } from '@shared/data/EventEntry';

export interface IAutoRegisterActualService {
  autoRegister(
    eventEntries: EventEntry[],
    activities: ActivityEvent[],
    targetDate: Date,
    userID: string
  ): Promise<EventEntry[]>;
}
