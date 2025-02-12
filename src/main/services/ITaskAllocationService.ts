import { TimeSlot } from '@shared/data/TimeSlot';
import { TaskAllocationResult } from '@shared/data/TaskAllocationResult';
import { Task } from '@shared/data/Task';

export interface ITaskAllocationService {
  allocate(
    timeSlot: TimeSlot<Date>[],
    tasks: Task[],
    taskExtraHours?: Map<string, number>
  ): Promise<TaskAllocationResult>;
}
