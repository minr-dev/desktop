import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { IIpcInitializer } from './IIpcInitializer';
import { IpcChannel } from '../../shared/constants';
import { GoogleAuthServiceImpl } from './GoogleAuthServiceImpl';
import { calendar_v3, google } from 'googleapis';

import { Calendar } from '@shared/dto/Calendar';

export class GoogleCalendarServiceImpl implements IIpcInitializer {
  private googleAuthService;

  constructor() {
    this.googleAuthService = new GoogleAuthServiceImpl();
  }

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(
      IpcChannel.GOOGLE_CALENDAR_GET,
      async (_event: IpcMainInvokeEvent, id: string) => {
        console.log(`ipcMain handle ${IpcChannel.GOOGLE_CALENDAR_GET}`);
        return await this.get(id);
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(IpcChannel.GOOGLE_CALENDAR_LIST, async (_event: IpcMainInvokeEvent) => {
      console.log(`ipcMain handle ${IpcChannel.GOOGLE_CALENDAR_LIST}`);
      return await this.list();
    });
  }

  async get(id: string): Promise<Calendar | undefined> {
    console.log(`main google calendar get ${id}`);
    const calendar = await this.getCalendar();

    try {
      const res = await calendar.calendarList.get({ calendarId: id });
      const items = this.convCalendar([res.data]);
      if (items.length === 0) {
        return undefined;
      }
      return items[0];
    } catch (err) {
      return undefined;
    }
  }

  async list(): Promise<Calendar[]> {
    console.log('main google calendar list');
    const calendar = await this.getCalendar();

    const res = await calendar.calendarList.list();
    const items = res.data.items;

    const results: Calendar[] = [];
    if (items) {
      return this.convCalendar(items);
    }
    return results;
  }

  private async getCalendar(): Promise<calendar_v3.Calendar> {
    const accessToken = await this.googleAuthService.getAccessToken();
    if (!accessToken) {
      throw new Error('accessToken is null');
    }
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    return google.calendar({ version: 'v3', auth: oauth2Client });
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
}
