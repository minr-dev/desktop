import { EventEntry } from '@shared/data/EventEntry';

export interface IAutoRegisterActualService {
  autoRegisterProvisionalActuals(targetDate: Date): Promise<EventEntry[]>;
  confirmActualRegistration(targetDate: Date): Promise<void>;
  deleteProvisionalActuals(targetDate: Date): Promise<void>;
}
