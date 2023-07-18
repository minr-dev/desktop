import { Calendar } from '@shared/dto/Calendar';

export interface ICalendarProxy {
  get(id: string): Promise<Calendar | undefined>;
  list(): Promise<Calendar[]>;
}
