import { EventEntry } from '@shared/data/EventEntry';

export interface IActualAutoRegistrationProxy {
  autoRegisterProvisonalActuals(targetDate: Date): Promise<EventEntry[]>;
  confirmActualRegistration(targetDate: Date): Promise<void>;
  deleteProvisionalActuals(targetDate: Date): Promise<void>;
}
