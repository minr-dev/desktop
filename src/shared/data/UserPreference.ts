import { CalendarSetting } from './CalendarSetting';
import { NotificationSettings } from './NotificationSettings';
import { TimeSlot } from './TimeSlot';

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

  // 保存すべきは時刻のみなので Date 型は冗長だが、TimePicker との兼ね合いで Date 型の方が都合がいいためこの保存形式にする。
  dailyWorkStartTime: Date;
  dailyWorkHours: number;
  dailyBreakTimeSlots: TimeSlot[];

  workingMinutes: number;
  breakMinutes: number;
  notifyAtPomodoroComplete: NotificationSettings;
  notifyBeforePomodoroComplete: NotificationSettings;

  theme?: string;
  openAiKey?: string;

  updated: Date;
}
