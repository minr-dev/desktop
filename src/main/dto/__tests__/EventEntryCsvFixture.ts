import { EventEntryCsv } from '../EventEntryCsv';

export class EventEntryCsvFixture {
  static default(override: Partial<EventEntryCsv> = {}): EventEntryCsv {
    return {
      eventEntryId: '1',
      eventType: '予定',
      start: '2024/12/30 10:00:00',
      end: '2024/12/30 10:00:00',
      summary: 'test1',
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
