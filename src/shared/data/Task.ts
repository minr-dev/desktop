export const PROJECT_FILTER = 'project_filter';

export enum TASK_STATUS {
  COMPLETED = 'completed',
  UNCOMPLETED = 'uncompleted',
}

export enum TASK_PRIORITY {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

export interface Task {
  id: string;
  name: string;
  description: string;
  projectId: string;
  status: TASK_STATUS;
  priority: TASK_PRIORITY;
  plannedHours?: number;
  dueDate?: Date;
  updated: Date;
}
