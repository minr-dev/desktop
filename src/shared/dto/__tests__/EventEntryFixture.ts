import { EventEntry, EVENT_TYPE } from '@shared/dto/EventEntry';

export class EventEntryFixture {
  static default(override: Partial<EventEntry> = {}): EventEntry {
    return {
      id: '1',
      eventType: EVENT_TYPE.PLAN,
      summary: 'Test Event',
      start: new Date('2023-07-01T10:00:00+0900'),
      end: new Date('2023-07-01T10:00:00+0900'),
      location: null,
      description: null,
      categoryId: null,
      labelIds: [],
      updated: new Date('2023-07-01T10:00:00+0900'),
      ...override,
    };
  }
}
