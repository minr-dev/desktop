import { Task, TASK_PRIORITY, TASK_STATUS } from '../Task';

export class TaskFixture {
  static default(override: Partial<Task> = {}): Task {
    return {
      id: '1',
      name: 'pattern-1',
      projectId: '1',
      description: 'test',
      status: TASK_STATUS.UNCOMPLETED,
      priority: TASK_PRIORITY.MEDIUM,
      updated: new Date('2023-07-01T10:00:00+0900'),
      ...override,
    };
  }
}
