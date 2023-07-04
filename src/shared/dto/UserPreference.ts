import { CalendarSetting } from './CalendarSetting';

export interface UserPreference {
  syncGoogleCalendar: boolean;
  accessToken: string;
  calendars: CalendarSetting[];

  announceTimeSignal: boolean;
  timeSignalInterval: number;
  timeSignalTextTemplate: string;
}
