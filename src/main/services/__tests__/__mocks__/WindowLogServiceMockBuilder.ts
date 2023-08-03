import { jest } from '@jest/globals';
import { WindowLog } from '@shared/dto/WindowLog';
import { IWindowLogService } from '../../IWindowLogService';

export class WindowLogServiceMockBuilder {
  private list: jest.MockedFunction<(start: Date, end: Date) => Promise<WindowLog[]>> = jest.fn();
  private get: jest.MockedFunction<(id: string) => Promise<WindowLog | undefined>> = jest.fn();
  private create: jest.MockedFunction<
    (basename: string, pid: string, title: string, path: string) => Promise<WindowLog>
  > = jest.fn();
  private save: jest.MockedFunction<(windowLog: WindowLog) => Promise<WindowLog>> = jest.fn();
  private delete: jest.MockedFunction<(id: string) => Promise<void>> = jest.fn();

  constructor() {
    this.list.mockResolvedValue([]);
    this.get.mockResolvedValue(undefined);
  }

  withList(result: WindowLog[]): WindowLogServiceMockBuilder {
    this.list.mockResolvedValue(result);
    return this;
  }

  withGet(result: WindowLog | undefined): WindowLogServiceMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withCreate(result: WindowLog): WindowLogServiceMockBuilder {
    this.create.mockResolvedValue(result);
    return this;
  }

  withSave(result: WindowLog): WindowLogServiceMockBuilder {
    this.save.mockResolvedValue(result);
    return this;
  }

  build(): IWindowLogService {
    const mock: IWindowLogService = {
      list: this.list,
      get: this.get,
      create: this.create,
      save: this.save,
      delete: this.delete,
    };
    return mock;
  }
}
