import { CalendarSetting } from '../CalendarSetting';
import { EVENT_TYPE } from '../EventEntry';

export class CalendarSettingFixture {
  static default(override: Partial<CalendarSetting> = {}): CalendarSetting {
    return {
      calendarId: 'calendar1',
      eventType: EVENT_TYPE.PLAN,
      ...override,
    };
  }
}
