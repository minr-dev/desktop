export interface PlanPattern {
  id: string;
  name: string;
  regularExpression?: string;
  categoryId?: string;
  labelIds?: string[];
  updated: Date;
}
