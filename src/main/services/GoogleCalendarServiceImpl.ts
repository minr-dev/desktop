import { inject, injectable } from 'inversify';
import { calendar_v3, google } from 'googleapis';

import { Calendar } from '@shared/data/Calendar';
import { IExternalCalendarService } from './IExternalCalendarService';
import { TYPES } from '@main/types';
import type { IAuthService } from './IAuthService';
import { ExternalEventEntry } from '@shared/data/ExternalEventEntry';
import { ExternalEventEntryFactory } from './ExternalEventEntryFactory';
import { EventDateTime } from '@shared/data/EventDateTime';
import type { ILoggerFactory } from './ILoggerFactory';

@injectable()
export class GoogleCalendarServiceImpl implements IExternalCalendarService {
  private logger;

  constructor(
    @inject(TYPES.GoogleAuthService)
    private readonly googleAuthService: IAuthService,
    @inject(TYPES.LoggerFactory)
    private readonly loggerFactory: ILoggerFactory
  ) {
    this.logger = this.loggerFactory.getLogger({
      processType: 'main',
      loggerName: 'GoogleCalendarServiceImpl',
    });
  }

  async get(calendarId: string): Promise<Calendar | undefined> {
    this.logger.info(`main google calendar get ${calendarId}`);
    const client = await this.getCalendarClient();

    try {
      const res = await client.calendarList.get({ calendarId: calendarId });
      const items = this.convCalendar([res.data]);
      if (items.length === 0) {
        return undefined;
      }
      return items[0];
    } catch (err) {
      this.logger.error(`get error: ${err}`);
      return undefined;
    }
  }

  async list(calendarId?: string): Promise<Calendar[]> {
    this.logger.info(`main google calendar list: ${calendarId}`);
    const client = await this.getCalendarClient();
    const res = await client.calendarList.list();
    const items = res.data.items;

    if (items) {
      if (!calendarId) {
        return this.convCalendar(items);
      } else {
        // calendarId が指定されている場合、該当するカレンダーだけを取得
        return this.convCalendar(items.filter((item) => calendarId === item.id));
      }
    }

    return [];
  }

  async listEvents(calendarId: string, start: Date, end?: Date): Promise<ExternalEventEntry[]> {
    this.logger.info(`listEvents: calendarId=${calendarId}`);
    const calendars = await this.list(calendarId);

    let results: ExternalEventEntry[] = [];
    for (const calendar of calendars) {
      const events = await this.listEventsByCalendar(calendar.id, start, end);
      results = results.concat(events);
    }

    return results;
  }

  private async listEventsByCalendar(
    calendarId: string,
    start: Date,
    end?: Date
  ): Promise<ExternalEventEntry[]> {
    this.logger.info(`listEventsByCalendar: calendarId=${calendarId} start=${start} end=${end}`);
    const client = await this.getCalendarClient();

    const res = await client.events.list({
      calendarId: calendarId,
      singleEvents: true, // 繰り返しのイベントを個別のイベントとして展開する
      timeMin: start.toISOString(),
      timeMax: end ? end.toISOString() : undefined,
    });
    const items = res.data.items;
    if (items) {
      return this.convToExternalEventEntry(calendarId, items);
    }
    return [];
  }

  private async getCalendarClient(): Promise<calendar_v3.Calendar> {
    const accessToken = await this.googleAuthService.getAccessToken();
    if (!accessToken) {
      this.logger.error('accessToken is null');
      throw new Error('accessToken is null');
    }
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const client = google.calendar({ version: 'v3', auth: oauth2Client });
    return client;
  }

  private convCalendar(items: calendar_v3.Schema$CalendarListEntry[]): Calendar[] {
    return items
      .filter((item) => {
        if (item.deleted) {
          return false;
        }
        if (!item.id) {
          return false;
        }
        return true;
      })
      .map((item) => {
        return {
          id: item.id ? item.id : '',
          summary: item.summary,
          description: item.description,
        };
      });
  }

  private convToMinrEventDateTime(
    src: calendar_v3.Schema$EventDateTime | undefined
  ): EventDateTime | null {
    if (src && (src.date || src.dateTime)) {
      return {
        date: src.date ? new Date(src.date) : null,
        dateTime: src.dateTime ? new Date(src.dateTime) : null,
      };
    }
    return null;
  }

  private convToGoogleEventDateTime(
    src: EventDateTime | undefined
  ): calendar_v3.Schema$EventDateTime | undefined {
    if (src && (src.date || src.dateTime)) {
      return {
        date: src.date ? src.date.toISOString() : null,
        dateTime: src.dateTime ? src.dateTime.toISOString() : null,
      };
    }
    return undefined;
  }

  private convToExternalEventEntry(
    calendarId: string,
    events: calendar_v3.Schema$Event[]
  ): ExternalEventEntry[] {
    return events
      .map((event: calendar_v3.Schema$Event) => {
        if (event.status === 'cancelled') {
          return null;
        }
        // console.log('event', event);
        const start = this.convToMinrEventDateTime(event.start);
        if (!start) {
          return null;
        }
        const end = this.convToMinrEventDateTime(event.end);
        if (!end) {
          return null;
        }
        const updated = event.updated
          ? new Date(event.updated)
          : event.created
          ? new Date(event.created)
          : new Date(0);
        if (!event.id) {
          return null;
        }
        return ExternalEventEntryFactory.create({
          id: {
            id: event.id,
            calendarId: calendarId,
            systemId: 'google',
          },
          summary: event.summary || '',
          start: start,
          end: end,
          location: event.location || null,
          description: event.description || null,
          updated: updated,
        });
      })
      .filter((event) => event !== null) as ExternalEventEntry[];
  }

  async saveEvent(data: ExternalEventEntry): Promise<ExternalEventEntry> {
    this.logger.info(`saveEvent: data=${data}`);
    if (!data.id.id) {
      return await this.insertEvent(data);
    } else {
      return await this.updateEvent(data);
    }
  }

  async insertEvent(data: ExternalEventEntry): Promise<ExternalEventEntry> {
    this.logger.info(`insertEvent: data=${data}`);
    if (!data.id || !data.id.calendarId) {
      this.logger.error('calendarId is null');
      throw new Error('calendarId is null');
    }
    const client = await this.getCalendarClient();
    const params: calendar_v3.Params$Resource$Events$Insert = {
      calendarId: data.id.calendarId,
      requestBody: {
        summary: data.summary,
        start: this.convToGoogleEventDateTime(data.start),
        end: this.convToGoogleEventDateTime(data.end),
        location: data.location,
        description: data.description,
      },
    };
    const result = await client.events.insert(params);
    // console.log('event', result);
    const converted = this.convToExternalEventEntry(data.id.calendarId, [result.data]);
    return converted[0];
  }

  async updateEvent(data: ExternalEventEntry): Promise<ExternalEventEntry> {
    this.logger.info(`updateEvent: data=${data}`);
    const client = await this.getCalendarClient();
    if (!data.id || !data.id.calendarId || !data.id.id) {
      this.logger.error('data.id.id is null');
      throw new Error('data.id.id is null');
    }
    const params: calendar_v3.Params$Resource$Events$Update = {
      calendarId: data.id.calendarId,
      eventId: data.id.id,
      requestBody: {
        summary: data.summary,
        start: this.convToGoogleEventDateTime(data.start),
        end: this.convToGoogleEventDateTime(data.end),
        location: data.location,
        description: data.description,
      },
    };
    const result = await client.events.update(params);
    // console.log('event', result);
    const converted = this.convToExternalEventEntry(data.id.calendarId, [result.data]);
    return converted[0];
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    this.logger.info(`deleteEvent: calendarId=${calendarId} eventId=${eventId}`);
    const client = await this.getCalendarClient();
    const params: calendar_v3.Params$Resource$Events$Delete = {
      calendarId: calendarId,
      eventId: eventId,
    };
    await client.events.delete(params);
    // console.log('event deleted');
  }
}
