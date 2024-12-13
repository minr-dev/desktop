import { EventEntryCsvSetting } from '@shared/data/EventEntryCsvSetting';

export interface IEventEntryCsvService {
  createCsv(eventEntryCsvSetting: EventEntryCsvSetting): Promise<string>;
}
