import { UserPreference } from '../UserPreference';
import { CalendarSettingFixture } from './CalendarSettingFixture';

export class UserPreferenceFixture {
  static default(override: Partial<UserPreference> = {}): UserPreference {
    return {
      userId: 'user123',
      syncGoogleCalendar: true,
      calendars: [CalendarSettingFixture.default()],
      startHourLocal: 9,
      speakEvent: true,
      speakEventTimeOffset: 15,
      speakEventTextTemplate: 'Event: {event}',
      speakTimeSignal: true,
      timeSignalInterval: 60,
      timeSignalTextTemplate: 'Time: {time}',
      muteWhileInMeeting: false,
      workingMinutes: 25,
      breakMinutes: 5,
      notifyAtPomodoroComplete: {
        announce: true,
        sendNotification: false,
        template: '{SESSION}が終了しました。',
      },
      notifyBeforePomodoroComplete: {
        announce: false,
        sendNotification: true,
        template: '{SESSION}終了まであと{TIME}分です。',
      },
      notifyBeforePomodoroCompleteTimeOffset: 10,
      updated: new Date(),
      ...override,
    };
  }
}
