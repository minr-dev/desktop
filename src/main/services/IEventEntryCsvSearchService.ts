import { EventEntryCsv } from '@shared/data/EventEntryCsv';
import { EventEntryCsvSetting } from '@shared/data/EventEntryCsvSetting';

export interface IEventEnryCsvSearchService {
  searchEventEntryCsv(eventEntryCsvSetting: EventEntryCsvSetting): Promise<EventEntryCsv[]>;
}
