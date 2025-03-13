import { EventEntrySearch } from '@main/dto/EventEntrySearch';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export interface IEventEntrySearchService {
  searchPlanAndActual(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE | undefined
  ): Promise<EventEntrySearch[]>;
  searchLabelAssociatedEvent(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventEntrySearch[]>;
}
