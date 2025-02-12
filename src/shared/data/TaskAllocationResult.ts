import { EventEntry } from './EventEntry';
import { OverrunTask } from './OverrunTask';

export interface TaskAllocationResult {
  taskAllocations: EventEntry[];
  overrunTasks: OverrunTask[];
}
