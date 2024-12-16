import { PlanAndActualCsv } from '../PlanAndActualCsv';

export class PlanAndActualCsvFixture {
  static default(override: Partial<PlanAndActualCsv> = {}): PlanAndActualCsv {
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
