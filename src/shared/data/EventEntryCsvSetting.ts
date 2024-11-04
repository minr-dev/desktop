import { EVENT_TYPE } from './EventEntry';

export interface EventEntryCsvSetting {
  start: Date;
  end: Date;
  eventType: EVENT_TYPE | undefined;
}
