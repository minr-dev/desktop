export const EVENT_TYPE = {
  PLAN: 'PLAN',
  ACTUAL: 'ACTUAL',
} as const;
export type EVENT_TYPE = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];
export const EVENT_TYPE_ITEMS: { id: EVENT_TYPE; name: string }[] = [
  { id: EVENT_TYPE.PLAN, name: '予定' },
  { id: EVENT_TYPE.ACTUAL, name: '実績' },
];

export interface ScheduleEvent {
  id: string;
  eventType: EVENT_TYPE;
  summary: string;
  start: Date;
  end: Date;
  location?: string | null;
  description?: string | null;
  categoryId?: string | null;
  labelIds?: string[];
  updated: Date;
}
