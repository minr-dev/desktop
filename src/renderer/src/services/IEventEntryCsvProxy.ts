import { EventEntryCsvSetting } from '@shared/data/EventEntryCsvSetting';

export interface IEventEntryCsvProxy {
  createCsv(eventEntryCsvSetting: EventEntryCsvSetting): Promise<string>;
}
