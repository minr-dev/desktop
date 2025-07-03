import { EventDateTime } from '@shared/data/EventDateTime';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';

export interface IEventEntryProxy {
  list(userId: string, start: Date, end: Date): Promise<EventEntry[]>;
  get(id: string): Promise<EventEntry | undefined>;
  create(
    userId: string,
    eventType: EVENT_TYPE,
    summary: string,
    start: EventDateTime,
    end: EventDateTime,
    isProvisional?: boolean
  ): Promise<EventEntry>;
  copy(original: EventEntry, eventType?: EVENT_TYPE, start?: Date, end?: Date): Promise<EventEntry>;
  save(eventEntry: EventEntry): Promise<EventEntry>;
  delete(id: string): Promise<void>;
}
