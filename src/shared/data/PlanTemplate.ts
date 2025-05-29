export interface PlanTemplate {
  id: string;
  userId: string;
  name: string;
  updated: Date;
  deleted?: Date | null;
}
