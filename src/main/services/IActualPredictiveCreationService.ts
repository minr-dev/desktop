import { EventEntry } from '@shared/data/EventEntry';

export interface IActualPredictiveCreationService {
  generatePredictedActual(start: Date, end: Date): Promise<EventEntry | null>;
}
