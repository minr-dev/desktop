import { Calendar } from '@shared/dto/Calendar';
import { ExternalEventEntry } from '@shared/dto/ExternalEventEntry';

export interface IExternalCalendarService {
  get(calendarId: string): Promise<Calendar | undefined>;
  list(calendarId: string): Promise<Calendar[]>;
  listEvents(calendarId: string, start: Date, end?: Date): Promise<ExternalEventEntry[]>;
  saveEvent(eventEntry: ExternalEventEntry): Promise<ExternalEventEntry>;
  deleteEvent(calendarId: string, eventId: string): Promise<void>;
}
