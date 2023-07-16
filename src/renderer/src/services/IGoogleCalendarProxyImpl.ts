import { Calendar } from '@shared/dto/Calendar';

export interface IGoogleCalendarProxyImpl {
  list(): Promise<Calendar[]>;
}
