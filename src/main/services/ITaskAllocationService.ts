import { TimeSlot } from '@shared/data/TimeSlot';
import { TaskAllocationResult } from '@shared/data/TaskAllocationResult';

export interface ITaskAllocationService {
  allocate(
    timeSlot: TimeSlot<Date>[],
    taskExtraHours?: Map<string, number>
  ): Promise<TaskAllocationResult>;
}
