import { TimeSlot } from '@shared/data/TimeSlot';

export interface IPlanAvailableTimeSlotService {
  calculateAvailableTimeSlot(targetDate: Date): Promise<TimeSlot<Date>[]>;
}
