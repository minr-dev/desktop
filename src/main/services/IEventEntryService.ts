import { EventEntry } from '@shared/data/EventEntry';

export interface IEventEntryService {
  list(userId: string, start: Date, end: Date): Promise<EventEntry[]>;
  get(id: string): Promise<EventEntry | undefined>;
  save(data: EventEntry): Promise<EventEntry>;
  logicalDelete(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
