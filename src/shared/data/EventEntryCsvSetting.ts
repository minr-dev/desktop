export const EVENT_TYPE = {
  PLAN: 'PLAN',
  ACTUAL: 'ACTUAL',
  SHARED: 'SHARED',
} as const;
export type EVENT_TYPE = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

export interface EventEntryCsvSetting {
  start: Date;
  end: Date;
  eventType: EVENT_TYPE | undefined;
}
