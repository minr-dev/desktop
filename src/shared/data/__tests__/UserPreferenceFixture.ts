import { UserPreference } from '../UserPreference';
import { CalendarSettingFixture } from './CalendarSettingFixture';
import { NotificationSettingsFixture } from './NotificationSettingsFixture';

export class UserPreferenceFixture {
  static default(override: Partial<UserPreference> = {}): UserPreference {
    return {
      userId: 'user123',
      syncGoogleCalendar: true,
      calendars: [CalendarSettingFixture.default()],
      startHourLocal: 9,
      dailyWorkStartTime: new Date('1970-01-01T10:00:00+0900'),
      dailyWorkHours: 8,
      dailyBreakTimeSlots: [],
      speakEvent: true,
      speakEventTimeOffset: 15,
      speakEventTextTemplate: 'Event: {event}',
      speakTimeSignal: true,
      timeSignalInterval: 60,
      timeSignalTextTemplate: 'Time: {time}',
      muteWhileInMeeting: false,
      workingMinutes: 25,
      breakMinutes: 5,
      notifyAtPomodoroComplete: NotificationSettingsFixture.default({
        useVoiceNotification: true,
        useDesktopNotification: false,
        notificationTimeOffset: 0,
        notificationTemplate: '{SESSION}が終了しました。',
      }),
      notifyBeforePomodoroComplete: NotificationSettingsFixture.default({
        useVoiceNotification: false,
        useDesktopNotification: true,
        notificationTemplate: '{SESSION}終了まであと{TIME}分です。',
        notificationTimeOffset: 10,
      }),
      updated: new Date(),
      ...override,
    };
  }
}
