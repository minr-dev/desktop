import { OverrunTask } from './OverrunTask';

export interface PlanAutoRegistrationResult {
  success: boolean;
  overrunTasks?: OverrunTask[];
}
