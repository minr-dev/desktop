import { CalendarSetting } from './CalendarSetting';

export interface UserPreference {
  userId: string;

  syncGoogleCalendar: boolean;
  calendars: CalendarSetting[];

  announceTimeSignal: boolean;
  timeSignalInterval: number;
  timeSignalTextTemplate: string;

  updated: Date;
}
