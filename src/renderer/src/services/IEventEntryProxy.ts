import { EVENT_TYPE, EventEntry } from '@shared/dto/EventEntry';

export interface IEventEntryProxy {
  list(start: Date, end: Date): Promise<EventEntry[]>;
  get(id: string): Promise<EventEntry | undefined>;
  create(eventType: EVENT_TYPE, summary: string, start: Date, end: Date): Promise<EventEntry>;
  save(eventEntry: EventEntry): Promise<EventEntry>;
  delete(id: string): Promise<void>;
}