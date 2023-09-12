import { Calendar } from '@shared/data/Calendar';

export interface ICalendarProxy {
  get(id: string): Promise<Calendar | undefined>;
}
