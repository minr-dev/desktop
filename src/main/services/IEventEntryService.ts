import { EventEntry } from '@shared/data/EventEntry';

export interface IEventEntryService {
  list(userId: string, start: Date, end: Date): Promise<EventEntry[]>;
  get(id: string): Promise<EventEntry | undefined>;
  save(data: EventEntry): Promise<EventEntry>;
  delete(id: string): Promise<void>;
}
