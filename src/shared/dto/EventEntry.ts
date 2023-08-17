import { EventDateTime } from './EventDateTime';
import { ExternalEventEntryId } from './ExternalEventEntry';

export const EVENT_TYPE = {
  PLAN: 'PLAN',
  ACTUAL: 'ACTUAL',
  SHARED: 'SHARED',
} as const;
export type EVENT_TYPE = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

export interface EventEntry {
  id: string;
  userId: string;
  eventType: EVENT_TYPE;
  summary: string;
  start: EventDateTime;
  end: EventDateTime;
  location?: string | null;
  description?: string | null;
  updated: Date;
  deleted?: Date | null;
  lastSynced?: Date | null;
  externalEventEntryId?: ExternalEventEntryId | null;
}
