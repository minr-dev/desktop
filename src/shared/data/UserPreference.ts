import { CalendarSetting } from './CalendarSetting';
import { PomodoroNotificationSetting } from './PomodoroNotificationSetting';

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
  notifyAtPomodoroComplete: PomodoroNotificationSetting;
  notifyBeforePomodoroComplete: PomodoroNotificationSetting;
  notifyBeforePomodoroCompleteTimeOffset: number;

  theme?: string;
  openAiKey?: string;

  updated: Date;
}
