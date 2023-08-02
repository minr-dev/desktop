import { jest } from '@jest/globals';
import { ActiveWindowLog } from '@shared/dto/ActiveWindowLog';
import { IActiveWindowLogProxy } from '../../IActiveWindowLogProxy';

export class ActiveWindowLogProxyMockBuilder {
  private list: jest.MockedFunction<(start: Date, end: Date) => Promise<ActiveWindowLog[]>> =
    jest.fn();
  private get: jest.MockedFunction<(id: string) => Promise<ActiveWindowLog | undefined>> =
    jest.fn();
  private save: jest.MockedFunction<
    (ActiveWindowLog: ActiveWindowLog) => Promise<ActiveWindowLog>
  > = jest.fn();

  constructor() {
    this.list.mockResolvedValue([]);
    this.get.mockResolvedValue(undefined);
  }

  withList(result: ActiveWindowLog[]): ActiveWindowLogProxyMockBuilder {
    this.list.mockResolvedValue(result);
    return this;
  }

  withGet(result: ActiveWindowLog | undefined): ActiveWindowLogProxyMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withSave(result: ActiveWindowLog): ActiveWindowLogProxyMockBuilder {
    this.save.mockResolvedValue(result);
    return this;
  }

  build(): IActiveWindowLogProxy {
    const mock: IActiveWindowLogProxy = {
      list: this.list,
      get: this.get,
      save: this.save,
    };
    return mock;
  }
}
