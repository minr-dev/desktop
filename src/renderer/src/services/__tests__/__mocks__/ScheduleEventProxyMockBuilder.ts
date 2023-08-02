import { jest } from '@jest/globals';
import { EVENT_TYPE, ScheduleEvent } from '@shared/dto/ScheduleEvent';
import { IScheduleEventProxy } from '../../IScheduleEventProxy';

export class ScheduleEventProxyMockBuilder {
  private list: jest.MockedFunction<(start: Date, end: Date) => Promise<ScheduleEvent[]>> =
    jest.fn();
  private create: jest.MockedFunction<
    (eventType: EVENT_TYPE, summary: string, start: Date, end: Date) => Promise<ScheduleEvent>
  > = jest.fn();
  private get: jest.MockedFunction<(id: string) => Promise<ScheduleEvent | undefined>> = jest.fn();
  private save: jest.MockedFunction<(ScheduleEvent: ScheduleEvent) => Promise<ScheduleEvent>> =
    jest.fn();
  private delete: jest.MockedFunction<(id: string) => Promise<void>> = jest.fn();

  constructor() {
    this.list.mockResolvedValue([]);
    this.get.mockResolvedValue(undefined);
  }

  withList(result: ScheduleEvent[]): ScheduleEventProxyMockBuilder {
    this.list.mockResolvedValue(result);
    return this;
  }

  withGet(result: ScheduleEvent | undefined): ScheduleEventProxyMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withCreate(result: ScheduleEvent): ScheduleEventProxyMockBuilder {
    this.create.mockResolvedValue(result);
    return this;
  }

  withSave(result: ScheduleEvent): ScheduleEventProxyMockBuilder {
    this.save.mockResolvedValue(result);
    return this;
  }

  build(): IScheduleEventProxy {
    const mock: IScheduleEventProxy = {
      list: this.list,
      get: this.get,
      create: this.create,
      save: this.save,
      delete: this.delete,
    };
    return mock;
  }
}
