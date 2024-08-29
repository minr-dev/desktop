export interface Task {
  id: string;
  name: string;
  description: string;
  projectId: string;
  projectName?: string;
  updated: Date;
}
