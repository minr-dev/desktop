import { jest } from '@jest/globals';
import { ActiveWindowLog } from '@shared/dto/ActiveWindowLog';
import { IActiveWindowLogService } from '../../IActiveWindowLogService';

export class ActiveWindowLogServiceMockBuilder {
  private list: jest.MockedFunction<(start: Date, end: Date) => Promise<ActiveWindowLog[]>> =
    jest.fn();
  private get: jest.MockedFunction<(id: string) => Promise<ActiveWindowLog | undefined>> =
    jest.fn();
  private create: jest.MockedFunction<
    (basename: string, pid: string, title: string, path: string) => Promise<ActiveWindowLog>
  > = jest.fn();
  private save: jest.MockedFunction<
    (ActiveWindowLog: ActiveWindowLog) => Promise<ActiveWindowLog>
  > = jest.fn();
  private delete: jest.MockedFunction<(id: string) => Promise<void>> = jest.fn();

  constructor() {
    this.list.mockResolvedValue([]);
    this.get.mockResolvedValue(undefined);
  }

  withList(result: ActiveWindowLog[]): ActiveWindowLogServiceMockBuilder {
    this.list.mockResolvedValue(result);
    return this;
  }

  withGet(result: ActiveWindowLog | undefined): ActiveWindowLogServiceMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withCreate(result: ActiveWindowLog): ActiveWindowLogServiceMockBuilder {
    this.create.mockResolvedValue(result);
    return this;
  }

  withSave(result: ActiveWindowLog): ActiveWindowLogServiceMockBuilder {
    this.save.mockResolvedValue(result);
    return this;
  }

  build(): IActiveWindowLogService {
    const mock: IActiveWindowLogService = {
      list: this.list,
      get: this.get,
      create: this.create,
      save: this.save,
      delete: this.delete,
    };
    return mock;
  }
}
