import { ScheduleEvent } from '@shared/dto/ScheduleEvent';

export interface IEventService {
  fetchEvents(start: Date, end: Date): Promise<ScheduleEvent[]>;
}
