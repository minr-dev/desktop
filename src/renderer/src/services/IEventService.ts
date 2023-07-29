import { ProcessedEvent } from '@aldabil/react-scheduler/types';

export interface IEventService {
  fetchEvents(start: Date, end: Date): Promise<ProcessedEvent[]>;
}
