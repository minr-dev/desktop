import { Calendar } from '@shared/dto/Calendar';

export interface IGoogleCalendarService {
  get(id: string): Promise<Calendar | undefined>;
  list(): Promise<Calendar[]>;
}
