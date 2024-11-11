export interface Pattern {
  id: string;

  name: string;
  basename?: string;
  regularExpression?: string;
  projectId?: string;
  categoryId?: string;
  labelIds?: string[];
  taskId?: string;

  updated: Date;
}
