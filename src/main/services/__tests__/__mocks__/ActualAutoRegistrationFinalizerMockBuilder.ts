import { jest } from '@jest/globals';
import { IActualAutoRegistrationFinalizer } from '@main/services/IActualAutoRegistrationFinalizer';
import { EventEntry } from '@shared/data/EventEntry';

export class ActualAutoRegistrationFinalizerMockBuilder {
  private finalizeRegistration: jest.MockedFunction<
    (mergedActuals: EventEntry[]) => Promise<void>
  > = jest.fn();

  build(): IActualAutoRegistrationFinalizer {
    const mock: IActualAutoRegistrationFinalizer = {
      finalizeRegistration: this.finalizeRegistration,
    };
    return mock;
  }
}
