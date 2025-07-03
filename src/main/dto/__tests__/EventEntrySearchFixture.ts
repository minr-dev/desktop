import { EVENT_TYPE } from '@shared/data/EventEntry';
import { EventEntrySearch } from '../EventEntrySearch';
import { EventDateTimeFixture } from '@shared/data/__tests__/EventEntryFixture';

export class EventEntrySearchFixture {
  static default(override: Partial<EventEntrySearch> = {}): EventEntrySearch {
    return {
      eventEntryId: '1',
      eventType: EVENT_TYPE.PLAN,
      start: EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T10:00:00+0900') }),
      end: EventDateTimeFixture.default({ dateTime: new Date('2024-12-30T10:00:00+0900') }),
      summary: 'test1',
      ...override,
    };
  }
}
