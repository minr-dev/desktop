import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';

export interface IEventEntryService {
  list(userId: string, start?: Date, end?: Date, eventType?: EVENT_TYPE): Promise<EventEntry[]>;
  get(id: string): Promise<EventEntry | undefined>;
  save(data: EventEntry): Promise<EventEntry>;
  bulkUpsert(data: EventEntry[]): Promise<EventEntry[]>;
  logicalDelete(id: string): Promise<void>;
  bulkLogicalDelete(ids: string[]): Promise<void>;
  delete(id: string): Promise<void>;
}
