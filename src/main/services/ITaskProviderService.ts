import { Task } from '@shared/data/Task';

export interface ITaskProviderService {
  getTasksForAllocation(targetDate: Date, projectId?: string): Promise<Task[]>;
}
