import { EventEntryCsv } from '@main/dto/EventEntryCsv';
import { IEventEntryCsvSearchService } from '@main/services/IEventEntryCsvSearchService';
import { EventEntryCsvSetting } from '@shared/data/EventEntryCsvSetting';

export class EventEntryCsvSearchServiceMockBuilder {
  private searchEventEntryCsv: jest.MockedFunction<
    (eventEntryCsvSetting: EventEntryCsvSetting) => Promise<EventEntryCsv[]>
  > = jest.fn();

  withSearchEventEntryCsv(result: EventEntryCsv[]): EventEntryCsvSearchServiceMockBuilder {
    this.searchEventEntryCsv.mockResolvedValue(result);
    return this;
  }

  build(): IEventEntryCsvSearchService {
    const mock: IEventEntryCsvSearchService = {
      searchEventEntryCsv: this.searchEventEntryCsv,
    };
    return mock;
  }
}
