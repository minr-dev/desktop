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

  startHourLocal: number;

  workingMinutes: number;
  breakMinutes: number;
  sendNotification: boolean;
  sendNotificationTimeOffset: number;
  sendNotificationTextTemplate: string;

  theme?: string;
  openAiKey?: string;

  updated: Date;
}
