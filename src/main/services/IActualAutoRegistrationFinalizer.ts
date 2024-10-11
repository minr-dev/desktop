import { EventEntry } from '@shared/data/EventEntry';

export interface IActualAutoRegistrationFinalizer {
  finalizeRegistration(mergedEvents: EventEntry[]): Promise<void>;
}
