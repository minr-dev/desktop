import { PlanTemplateEvent } from '../PlanTemplateEvent';

export class PlanTemplateEventFixture {
  static default(override: Partial<PlanTemplateEvent>): PlanTemplateEvent {
    return {
      id: '1',
      userId: 'user1',
      templateId: 'template1',
      summary: 'Test Event',
      start: { hours: 11, minutes: 0 },
      end: { hours: 11, minutes: 30 },
      description: null,
      projectId: null,
      categoryId: null,
      taskId: null,
      labelIds: null,
      updated: new Date('2023-07-01T10:00:00+0900'),
      ...override,
    };
  }
}
