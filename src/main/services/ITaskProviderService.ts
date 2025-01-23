import { Task } from '@shared/data/Task';

export interface ITaskProviderService {
  getTasksForAllocation(targetDate: Date): Promise<Task[]>;
}
