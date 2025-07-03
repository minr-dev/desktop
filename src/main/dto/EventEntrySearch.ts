import { EventDateTime } from '@shared/data/EventDateTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export interface EventEntrySearch {
  eventEntryId: string;
  eventType: EVENT_TYPE;
  start: EventDateTime;
  end: EventDateTime;
  summary: string;
  projectId?: string | null;
  projectName?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  taskId?: string | null;
  taskName?: string | null;
  labelIds?: string[] | null;
  labelNames?: string[] | null;
  description?: string | null;
}
