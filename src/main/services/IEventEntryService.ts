import { EventEntry } from '@shared/dto/EventEntry';

export interface IEventEntryService {
  list(start: Date, end: Date): Promise<EventEntry[]>;
  get(id: string): Promise<EventEntry | undefined>;
  save(data: EventEntry): Promise<EventEntry>;
  delete(id: string): Promise<void>;
}
