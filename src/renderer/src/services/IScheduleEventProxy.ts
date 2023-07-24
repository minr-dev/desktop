import { EVENT_TYPE, ScheduleEvent } from '@shared/dto/ScheduleEvent';

export interface IScheduleEventProxy {
  list(start: Date, end: Date): Promise<ScheduleEvent[]>;
  get(id: string): Promise<ScheduleEvent | undefined>;
  create(eventType: EVENT_TYPE, summary: string, start: Date, end: Date): Promise<ScheduleEvent>;
  save(scheduleEvent: ScheduleEvent): Promise<ScheduleEvent>;
  delete(id: string): Promise<void>;
}
