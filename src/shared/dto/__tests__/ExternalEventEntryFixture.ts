import { ExternalEventEntry, ExternalEventEntryId } from '../ExternalEventEntry';
import { EventDateTimeFixture } from './EventEntryFixture';

export class ExternalEventEntryFixture {
  static default(override: Partial<ExternalEventEntry> = {}): ExternalEventEntry {
    return {
      id: ExternalEventEntryIdFixture.default(),
      summary: 'External Event 1',
      start: EventDateTimeFixture.default({ dateTime: new Date('2023-07-01T10:00:00+0900') }),
      end: EventDateTimeFixture.default({ dateTime: new Date('2023-07-01T10:00:00+0900') }),
      location: null,
      description: null,
      updated: new Date('2023-07-01T10:00:00+0900'),
      ...override,
    };
  }
}

export class ExternalEventEntryIdFixture {
  static default(override: Partial<ExternalEventEntryId> = {}): ExternalEventEntryId {
    return {
      id: '1',
      systemId: 'system1',
      calendarId: 'calendar1',
      ...override,
    };
  }
}
