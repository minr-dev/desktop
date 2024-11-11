import { jest } from '@jest/globals';
import { IActualPredictiveCreationService } from '@main/services/IActualPredictiveCreationService';
import { EventEntry } from '@shared/data/EventEntry';

export class ActualPredictiveCreationServiceMockBuilder {
  private buildActual: jest.MockedFunction<(start: Date, end: Date) => Promise<EventEntry | null>> =
    jest.fn();

  build(): IActualPredictiveCreationService {
    const mock: IActualPredictiveCreationService = {
      generatePredictedActual: this.buildActual,
    };
    return mock;
  }
}
