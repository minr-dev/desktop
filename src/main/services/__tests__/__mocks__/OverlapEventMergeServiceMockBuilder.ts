import { jest } from '@jest/globals';
import { IOverlapEventMergeService } from '@main/services/IOverlapEventMergeService';
import { EventEntry } from '@shared/data/EventEntry';

export class OverlapEventMergeServiceMockBuilder {
  private mergeOverlapEvent: jest.MockedFunction<(events: EventEntry[]) => EventEntry[]> =
    jest.fn();

  build(): IOverlapEventMergeService {
    const mock: IOverlapEventMergeService = {
      mergeOverlapEvent: this.mergeOverlapEvent,
    };
    return mock;
  }
}
