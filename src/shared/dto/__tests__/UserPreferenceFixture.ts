import { UserPreference } from '../UserPreference';
import { CalendarSettingFixture } from './CalendarSettingFixture';

export class UserPreferenceFixture {
  static default(override: Partial<UserPreference> = {}): UserPreference {
    return {
      userId: 'user123',
      syncGoogleCalendar: true,
      calendars: [CalendarSettingFixture.default()],
      speakEvent: true,
      speakEventTimeOffset: 15,
      speakEventTextTemplate: 'Event: {event}',
      speakTimeSignal: true,
      timeSignalInterval: 60,
      timeSignalTextTemplate: 'Time: {time}',
      muteWhileInMeeting: false,
      updated: new Date(),
      ...override,
    };
  }
}
