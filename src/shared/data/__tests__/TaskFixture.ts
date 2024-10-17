import { Task } from '../Task';

export class TaskFixture {
  static default(override: Partial<Task> = {}): Task {
    return {
      id: '1',
      name: 'pattern-1',
      projectId: '1',
      description: 'test',
      updated: new Date('2023-07-01T10:00:00+0900'),
      ...override,
    };
  }
}
