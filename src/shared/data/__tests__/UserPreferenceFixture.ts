import { UserPreference } from '../UserPreference';
import { CalendarSettingFixture } from './CalendarSettingFixture';
import { NotificationSettingsFixture } from './NotificationSettingsFixture';

export class UserPreferenceFixture {
  static default(override: Partial<UserPreference> = {}): UserPreference {
    return {
      userId: 'user123',
      openAtLogin: false,
      syncGoogleCalendar: true,
      calendars: [CalendarSettingFixture.default()],
      startHourLocal: 9,
      dailyWorkStartTime: { hours: 10, minutes: 0 },
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
