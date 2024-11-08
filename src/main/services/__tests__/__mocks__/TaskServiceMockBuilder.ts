import { jest } from '@jest/globals';
import { ITaskService } from '@main/services/ITaskService';
import { Page } from '@shared/data/Page';
import { Task } from '@shared/data/Task';

export class TaskServiceMockBuilder {
  private list: jest.MockedFunction<() => Promise<Page<Task>>> = jest.fn();
  private get: jest.MockedFunction<() => Promise<Task>> = jest.fn();
  private save: jest.MockedFunction<() => Promise<Task>> = jest.fn();
  private delete: jest.MockedFunction<() => Promise<void>> = jest.fn();
  private bulkDelete: jest.MockedFunction<() => Promise<void>> = jest.fn();

  build(): ITaskService {
    const mock: ITaskService = {
      list: this.list,
      get: this.get,
      save: this.save,
      delete: this.delete,
      bulkDelete: this.bulkDelete,
    };
    return mock;
  }
}
