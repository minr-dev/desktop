import { EventEntryCsv } from '@main/dto/EventEntryCsv';
import { EventEntryCsvSetting } from '@shared/data/EventEntryCsvSetting';

export interface IEventEntryCsvSearchService {
  searchEventEntryCsv(eventEntryCsvSetting: EventEntryCsvSetting): Promise<EventEntryCsv[]>;
}
