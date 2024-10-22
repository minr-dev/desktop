export const EVENT_TYPE_NAME = {
  PLAN: '予定',
  ACTUAL: '実績',
  SHARED: '共有',
} as const;
export type EVENT_TYPE_NAME = (typeof EVENT_TYPE_NAME)[keyof typeof EVENT_TYPE_NAME];

export interface EventEntryCsv {
  eventEntryId: string;
  eventType: EVENT_TYPE_NAME;
  start: string;
  end: string;
  summary: string;
  projectId: string;
  projectName: string;
  categoryId: string;
  categoryName: string;
  taskId: string;
  taskName: string;
  labelIds: string;
  labelNames: string;
  description: string;
}
