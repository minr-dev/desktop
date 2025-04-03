import { EventEntrySearch } from '@main/dto/EventEntrySearch';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export interface EventEntrySearchParams {
  start?: Date;
  end?: Date;
  eventType?: EVENT_TYPE;
}

export interface IEventEntrySearchService {
  getPlanAndActuals(params: EventEntrySearchParams): Promise<EventEntrySearch[]>;
  getProjectAssociatedEvents(params: EventEntrySearchParams): Promise<EventEntrySearch[]>;
  getCategoryAssociatedEvents(params: EventEntrySearchParams): Promise<EventEntrySearch[]>;
  getTaskAssociatedEvents(params: EventEntrySearchParams): Promise<EventEntrySearch[]>;
  getLabelAssociatedEvents(params: EventEntrySearchParams): Promise<EventEntrySearch[]>;
}
