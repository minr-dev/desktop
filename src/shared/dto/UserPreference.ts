import { CalendarSetting } from './CalendarSetting';

export interface UserPreference {
  syncGoogleCalendar: boolean;
  calendars: CalendarSetting[];

  announceTimeSignal: boolean;
  timeSignalInterval: number;
  timeSignalTextTemplate: string;
}
