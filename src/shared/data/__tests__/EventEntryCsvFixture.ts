import { EventEntryCsv } from '../EventEntryCsv';

export class EventEntryCsvFixture {
  static default(override: Partial<EventEntryCsv> = {}): EventEntryCsv {
    return {
        eventEntryId: '123456789',
        eventType: '予定',
        start: '2024/01/01 00:00',
        end: '2024/01/01 01:00',
        summary: '',
        projectId: '',
        projectName: '',
        categoryId: '',
        categoryName: '',
        taskId: '',
        taskName: '',
        labelIds: '',
        labelNames: '',
        description: '',
        ...override,
      };
  }
}
