import { jest } from '@jest/globals';
import { IActualAutoRegistrationFinalizerService } from '@main/services/IActualAutoRegistrationFinalizerService';
import { EventEntry } from '@shared/data/EventEntry';

export class ActualAutoRegistrationFinalizerServiceMockBuilder {
  private finalizeRegistration: jest.MockedFunction<
    (mergedActuals: EventEntry[]) => Promise<void>
  > = jest.fn();

  build(): IActualAutoRegistrationFinalizerService {
    const mock: IActualAutoRegistrationFinalizerService = {
      finalizeRegistration: this.finalizeRegistration,
    };
    return mock;
  }
}
