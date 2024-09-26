import { EventEntry } from '@shared/data/EventEntry';

export interface IActualAutoRegistrationFinalizerService {
  finalizeRegistration(mergedEvents: EventEntry[]): Promise<void>;
}
