import { EventEntrySearch } from '@main/dto/EventEntrySearch';
import { IEventEntrySearchService } from '@main/services/IEventEntrySearchService';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export class EventEntrySearchServiceMockBuilder {
  private getPlanAndActuals: jest.MockedFunction<
    (start: Date, end: Date, eventType: EVENT_TYPE | undefined) => Promise<EventEntrySearch[]>
  > = jest.fn();
  private getProjectAssociatedEvents: jest.MockedFunction<
    (start: Date, end: Date, eventType: EVENT_TYPE) => Promise<EventEntrySearch[]>
  > = jest.fn();
  private getCategoryAssociatedEvents: jest.MockedFunction<
    (start: Date, end: Date, eventType: EVENT_TYPE) => Promise<EventEntrySearch[]>
  > = jest.fn();
  private getTaskAssociatedEvents: jest.MockedFunction<
    (start?: Date, end?: Date, eventType?: EVENT_TYPE) => Promise<EventEntrySearch[]>
  > = jest.fn();
  private getLabelAssociatedEvents: jest.MockedFunction<
    (start: Date, end: Date, eventType: EVENT_TYPE) => Promise<EventEntrySearch[]>
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
