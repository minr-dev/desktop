import { EventEntry, EVENT_TYPE } from '@shared/dto/EventEntry';
import { EventDateTime } from '../EventDateTime';

export class EventEntryFixture {
  static default(override: Partial<EventEntry> = {}): EventEntry {
    return {
      id: '1',
      userId: 'user1',
      eventType: EVENT_TYPE.PLAN,
      summary: 'Test Event',
      start: EventDateTimeFixture.default({ dateTime: new Date('2023-07-01T10:00:00+0900') }),
      end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-01T10:00:00+0900') }),
      location: null,
      description: null,
      lastSynced: null,
      updated: new Date('2023-07-01T10:00:00+0900'),
      deleted: null,
      ...override,
    };
  }
}

export class EventDateTimeFixture {
  static default(override: Partial<EventDateTime> = {}): EventDateTime {
    return {
      date: null,
      dateTime: new Date('2023-07-01T10:00:00+0900'),
      ...override,
    };
  }
}
