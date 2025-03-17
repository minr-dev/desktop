import { EventEntrySearch } from '@main/dto/EventEntrySearch';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export interface IEventEntrySearchService {
  getPlanAndActuals(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE | undefined
  ): Promise<EventEntrySearch[]>;
  getProjectAssociatedEvents(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventEntrySearch[]>;
  getCategoryAssociatedEvents(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventEntrySearch[]>;
  getTaskAssociatedEvents(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventEntrySearch[]>;
  getLabelAssociatedEvents(
    start: Date,
    end: Date,
    eventType: EVENT_TYPE
  ): Promise<EventEntrySearch[]>;
}
