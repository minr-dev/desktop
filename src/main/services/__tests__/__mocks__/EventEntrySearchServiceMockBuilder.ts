import { EventEntrySearch } from '@main/dto/EventEntrySearch';
import {
  EventEntrySearchParams,
  IEventEntrySearchService,
} from '@main/services/IEventEntrySearchService';

export class EventEntrySearchServiceMockBuilder {
  private getPlanAndActuals: jest.MockedFunction<
    (params: EventEntrySearchParams) => Promise<EventEntrySearch[]>
  > = jest.fn();
  private getProjectAssociatedEvents: jest.MockedFunction<
    (params: EventEntrySearchParams) => Promise<EventEntrySearch[]>
  > = jest.fn();
  private getCategoryAssociatedEvents: jest.MockedFunction<
    (params: EventEntrySearchParams) => Promise<EventEntrySearch[]>
  > = jest.fn();
  private getTaskAssociatedEvents: jest.MockedFunction<
    (params: EventEntrySearchParams) => Promise<EventEntrySearch[]>
  > = jest.fn();
  private getLabelAssociatedEvents: jest.MockedFunction<
    (params: EventEntrySearchParams) => Promise<EventEntrySearch[]>
  > = jest.fn();

  build(): IEventEntrySearchService {
    const mock: IEventEntrySearchService = {
      getPlanAndActuals: this.getPlanAndActuals,
      getProjectAssociatedEvents: this.getProjectAssociatedEvents,
      getCategoryAssociatedEvents: this.getCategoryAssociatedEvents,
      getTaskAssociatedEvents: this.getTaskAssociatedEvents,
      getLabelAssociatedEvents: this.getLabelAssociatedEvents,
    };
    return mock;
  }
}
