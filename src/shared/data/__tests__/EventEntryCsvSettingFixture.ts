import { EventEntryCsvSetting } from '../EventEntryCsvSetting';

export class EventEntryCsvSettingFixture {
  static default(override: Partial<EventEntryCsvSetting> = {}): EventEntryCsvSetting {
    return {
      start: new Date('2024-10-01T00:00:00+0900'),
      end: new Date('2024-10-01T01:00:00+0900'),
      eventType: 'ACTUAL',
      ...override,
    };
  }
}
