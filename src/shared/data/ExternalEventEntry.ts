import { EventDateTime } from './EventDateTime';

export interface ExternalEventEntryId {
  id?: string;
  systemId?: string;
  calendarId: string;
}

/**
 * ExternalEventEntry は、外部のカレンダーのイベントを表す。
 */
export interface ExternalEventEntry {
  id: ExternalEventEntryId;
  summary: string;
  start: EventDateTime;
  end: EventDateTime;
  location?: string | null;
  description?: string | null;
  updated?: Date;
}

export const toStringExternalEventEntryId = (id: ExternalEventEntryId): string => {
  return `${id.id}-${id.calendarId}-${id.systemId}`;
};

export const createExternalEventEntry = (overlaps: ExternalEventEntry): ExternalEventEntry => {
  return {
    ...overlaps,
  };
};
