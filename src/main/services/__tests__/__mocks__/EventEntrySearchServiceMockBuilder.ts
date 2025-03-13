import { EventEntrySearch } from '@main/dto/EventEntrySearch';
import { IEventEntrySearchService } from '@main/services/IEventEntrySearchService';
import { EVENT_TYPE } from '@shared/data/EventEntry';

export class EventEntrySearchServiceMockBuilder {
  private searchPlanAndActual: jest.MockedFunction<
    (start: Date, end: Date, eventType: EVENT_TYPE | undefined) => Promise<EventEntrySearch[]>
  > = jest.fn();

  withSearchPlanAndActual(result: EventEntrySearch[]): EventEntrySearchServiceMockBuilder {
    this.searchPlanAndActual.mockResolvedValue(result);
    return this;
  }

  build(): IEventEntrySearchService {
    const mock: IEventEntrySearchService = {
      searchPlanAndActual: this.searchPlanAndActual,
    };
    return mock;
  }
}
