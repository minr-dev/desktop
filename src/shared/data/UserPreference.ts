import { CalendarSetting } from './CalendarSetting';
import { NotificationSettings } from './NotificationSettings';

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
  notifyAtPomodoroComplete: NotificationSettings;
  notifyBeforePomodoroComplete: NotificationSettings;

  theme?: string;
  openAiKey?: string;

  updated: Date;
}
