import { CalendarSetting } from './CalendarSetting';

export interface UserPreference {
  userId: string;

  syncGoogleCalendar: boolean;
  calendars: CalendarSetting[];

  speakEvent: boolean;
  speakEventTimeOffset: number;
  speakEventTextTemplate: string;

  speakTimeSignal: boolean;
  timeSignalInterval: number;
  timeSignalTextTemplate: string;

  muteWhileInMeeting: boolean;

  theme?: string;
  openAiKey?: string;

  updated: Date;
}
