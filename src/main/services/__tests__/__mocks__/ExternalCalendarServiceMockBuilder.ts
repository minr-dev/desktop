import { jest } from '@jest/globals';
import { IExternalCalendarService } from '@main/services/IExternalCalendarService';
import { Calendar } from '@shared/dto/Calendar';
import { ExternalEventEntry } from '@shared/dto/ExternalEventEntry';

export class ExternalCalendarServiceMockBuilder {
  private get: jest.MockedFunction<(calendarId: string) => Promise<Calendar | undefined>> =
    jest.fn();
  private list: jest.MockedFunction<(calendarId: string) => Promise<Calendar[]>> = jest.fn();
  private listEvents: jest.MockedFunction<
    (calendarId: string, start: Date, end?: Date) => Promise<ExternalEventEntry[]>
  > = jest.fn();
  private saveEvent: jest.MockedFunction<
    (eventEntry: ExternalEventEntry) => Promise<ExternalEventEntry>
  > = jest.fn();
  private deleteEvent: jest.MockedFunction<(calendarId: string, eventId: string) => Promise<void>> =
    jest.fn();

  withGet(result: Calendar | undefined): ExternalCalendarServiceMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withList(result: Calendar[]): ExternalCalendarServiceMockBuilder {
    this.list.mockResolvedValue(result);
    return this;
  }

  withListEvents(result: ExternalEventEntry[]): ExternalCalendarServiceMockBuilder {
    this.listEvents.mockResolvedValue(result);
    return this;
  }

  withSaveEvent(result: ExternalEventEntry): ExternalCalendarServiceMockBuilder {
    this.saveEvent.mockResolvedValue(result);
    return this;
  }

  withDeleteEvent(): ExternalCalendarServiceMockBuilder {
    this.deleteEvent.mockResolvedValue();
    return this;
  }

  build(): IExternalCalendarService {
    const mock: IExternalCalendarService = {
      get: this.get,
      list: this.list,
      listEvents: this.listEvents,
      saveEvent: this.saveEvent,
      deleteEvent: this.deleteEvent,
    };
    return mock;
  }
}
