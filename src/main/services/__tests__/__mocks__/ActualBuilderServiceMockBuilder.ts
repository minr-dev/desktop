import { jest } from '@jest/globals';
import { IActualBuilderService } from '@main/services/IActualBuilderService';
import { EventEntry } from '@shared/data/EventEntry';

export class ActualBuilderServiceMockBuilder {
  private buildActual: jest.MockedFunction<(start: Date, end: Date) => Promise<EventEntry | null>> =
    jest.fn();

  build(): IActualBuilderService {
    const mock: IActualBuilderService = {
      buildActual: this.buildActual,
    };
    return mock;
  }
}
