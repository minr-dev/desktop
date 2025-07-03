import { OverrunTask } from '../OverrunTask';

export class OverrunTaskFixture {
  static default(override: Partial<OverrunTask> = {}): OverrunTask {
    return {
      taskId: '1',
      schduledTime: 0,
      ...override,
    };
  }
}
