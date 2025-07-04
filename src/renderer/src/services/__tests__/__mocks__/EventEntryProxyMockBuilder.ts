import { jest } from '@jest/globals';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { IEventEntryProxy } from '../../IEventEntryProxy';
import { EventDateTime } from '@shared/data/EventDateTime';

export class EventEntryProxyMockBuilder {
  private list: jest.MockedFunction<
    (userId: string, start: Date, end: Date) => Promise<EventEntry[]>
  > = jest.fn();
  private create: jest.MockedFunction<
    (
      userId: string,
      eventType: EVENT_TYPE,
      summary: string,
      start: EventDateTime,
      end: EventDateTime,
      isProvisional?: boolean
    ) => Promise<EventEntry>
  > = jest.fn();
  private copy: jest.MockedFunction<
    (original: EventEntry, eventType?: EVENT_TYPE, start?: Date, end?: Date) => Promise<EventEntry>
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
      copy: this.copy,
      save: this.save,
      delete: this.delete,
    };
    return mock;
  }
}
