import { jest } from '@jest/globals';
import { IEventEntryService } from '@main/services/IEventEntryService';
import { EventEntry } from '@shared/data/EventEntry';

export class EventEntryServiceMockBuilder {
  private list: jest.MockedFunction<
    (userId: string, start: Date, end: Date, eventType?: string) => Promise<EventEntry[]>
  > = jest.fn();
  private get: jest.MockedFunction<(id: string) => Promise<EventEntry | undefined>> = jest.fn();
  private getAllByTasks: jest.MockedFunction<(userId: string, taskIds) => Promise<EventEntry[]>> =
    jest.fn();
  private save: jest.MockedFunction<(data: EventEntry) => Promise<EventEntry>> = jest.fn();
  private bulkUpsert: jest.MockedFunction<(data: EventEntry[]) => Promise<EventEntry[]>> =
    jest.fn();
  private logicalDelete: jest.MockedFunction<(id: string) => Promise<void>> = jest.fn();
  private bulkLogicalDelete: jest.MockedFunction<(ids: string[]) => Promise<void>> = jest.fn();
  private delete: jest.MockedFunction<(id: string) => Promise<void>> = jest.fn();

  constructor() {
    this.list.mockResolvedValue([]);
  }

  withList(result: EventEntry[]): EventEntryServiceMockBuilder {
    this.list.mockResolvedValue(result);
    return this;
  }

  withGet(result: EventEntry | undefined): EventEntryServiceMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withSave(result: EventEntry): EventEntryServiceMockBuilder {
    this.save.mockResolvedValue(result);
    return this;
  }

  withDelete(): EventEntryServiceMockBuilder {
    this.delete.mockResolvedValue(undefined);
    return this;
  }

  build(): IEventEntryService {
    const mock: IEventEntryService = {
      list: this.list,
      get: this.get,
      getAllByTasks: this.getAllByTasks,
      save: this.save,
      bulkUpsert: this.bulkUpsert,
      logicalDelete: this.logicalDelete,
      bulkLogicalDelete: this.bulkLogicalDelete,
      delete: this.delete,
    };
    return mock;
  }
}
