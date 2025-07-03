import { Calendar } from '@shared/data/Calendar';
import { ExternalEventEntry } from '@shared/data/ExternalEventEntry';

export interface IExternalCalendarService {
  get(calendarId: string): Promise<Calendar | undefined>;
  list(calendarId: string): Promise<Calendar[]>;
  listEvents(calendarId: string, start: Date, end?: Date): Promise<ExternalEventEntry[]>;
  saveEvent(eventEntry: ExternalEventEntry): Promise<ExternalEventEntry>;
  deleteEvent(calendarId: string, eventId: string): Promise<void>;
}
