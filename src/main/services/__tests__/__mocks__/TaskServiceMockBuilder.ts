import { jest } from '@jest/globals';
import { ITaskService } from '@main/services/ITaskService';
import { Page, Pageable } from '@shared/data/Page';
import { Task } from '@shared/data/Task';

export class TaskServiceMockBuilder {
  private list: jest.MockedFunction<
    (pageable: Pageable, projectId?: string) => Promise<Page<Task>>
  > = jest.fn();
  private get: jest.MockedFunction<(id: string) => Promise<Task>> = jest.fn();
  private getAll: jest.MockedFunction<(ids: string[]) => Promise<Task[]>> = jest.fn();
  private save: jest.MockedFunction<(task: Task) => Promise<Task>> = jest.fn();
  private delete: jest.MockedFunction<(id: string) => Promise<void>> = jest.fn();
  private bulkDelete: jest.MockedFunction<(ids: string[]) => Promise<void>> = jest.fn();

  constructor() {
    this.getAll.mockResolvedValue([]);
  }

  withList(result: Page<Task>): TaskServiceMockBuilder {
    this.list.mockResolvedValue(result);
    return this;
  }

  withGet(result: Task): TaskServiceMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withGetAll(result: Task[]): TaskServiceMockBuilder {
    this.getAll.mockResolvedValue(result);
    return this;
  }

  withSave(result: Task): TaskServiceMockBuilder {
    this.save.mockResolvedValue(result);
    return this;
  }

  withDelete(): TaskServiceMockBuilder {
    this.delete.mockResolvedValue(undefined);
    return this;
  }

  withBulkDelete(): TaskServiceMockBuilder {
    this.bulkDelete.mockResolvedValue(undefined);
    return this;
  }

  build(): ITaskService {
    const mock: ITaskService = {
      list: this.list,
      get: this.get,
      getAll: this.getAll,
      save: this.save,
      delete: this.delete,
      bulkDelete: this.bulkDelete,
    };
    return mock;
  }
}
