import { jest } from '@jest/globals';
import { EVENT_TYPE, EventEntry } from '@shared/dto/EventEntry';
import { IEventEntryProxy } from '../../IEventEntryProxy';

export class EventEntryProxyMockBuilder {
  private list: jest.MockedFunction<(start: Date, end: Date) => Promise<EventEntry[]>> = jest.fn();
  private create: jest.MockedFunction<
    (eventType: EVENT_TYPE, summary: string, start: Date, end: Date) => Promise<EventEntry>
  > = jest.fn();
  private get: jest.MockedFunction<(id: string) => Promise<EventEntry | undefined>> = jest.fn();
  private save: jest.MockedFunction<(eventEntry: EventEntry) => Promise<EventEntry>> = jest.fn();
  private delete: jest.MockedFunction<(id: string) => Promise<void>> = jest.fn();

  constructor() {
    this.list.mockResolvedValue([]);
    this.get.mockResolvedValue(undefined);
  }

  withList(result: EventEntry[]): EventEntryProxyMockBuilder {
    this.list.mockResolvedValue(result);
    return this;
  }

  withGet(result: EventEntry | undefined): EventEntryProxyMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withCreate(result: EventEntry): EventEntryProxyMockBuilder {
    this.create.mockResolvedValue(result);
    return this;
  }

  withSave(result: EventEntry): EventEntryProxyMockBuilder {
    this.save.mockResolvedValue(result);
    return this;
  }

  build(): IEventEntryProxy {
    const mock: IEventEntryProxy = {
      list: this.list,
      get: this.get,
      create: this.create,
      save: this.save,
      delete: this.delete,
    };
    return mock;
  }
}
