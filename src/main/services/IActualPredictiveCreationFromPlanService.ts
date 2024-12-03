import { EventEntry } from '@shared/data/EventEntry';

export interface IActualPredictiveCreationFromPlanService {
  generatePredictedActual(start: Date, end: Date): Promise<EventEntry[] | null>;
}
