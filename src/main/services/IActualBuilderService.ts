import { EventEntry } from '@shared/data/EventEntry';

export interface IActualBuilderService {
  buildActual(start: Date, end: Date): Promise<EventEntry | null>;
}
