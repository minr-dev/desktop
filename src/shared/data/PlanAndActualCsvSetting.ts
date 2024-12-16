import { EVENT_TYPE } from './EventEntry';

export interface PlanAndActualCsvSetting {
  start: Date;
  end: Date;
  eventType: EVENT_TYPE | undefined;
}
