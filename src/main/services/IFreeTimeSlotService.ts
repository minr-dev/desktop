import { TimeSlot } from '@shared/data/TimeSlot';

export interface IFreeTimeSlotService {
  calculateFreeTimeSlot(targetDate: Date): Promise<TimeSlot<Date>[]>;
}
