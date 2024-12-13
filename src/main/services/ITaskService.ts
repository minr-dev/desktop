import { Page, Pageable } from '@shared/data/Page';
import { Task } from '@shared/data/Task';

export interface ITaskService {
  list(pageable: Pageable, projectId?: string): Promise<Page<Task>>;
  get(id: string): Promise<Task>;
  getAll(ids: string[]): Promise<Task[]>;
  save(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}
