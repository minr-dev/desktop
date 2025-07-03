import { PlanAndActualCsvSetting } from '../PlanAndActualCsvSetting';

export class PlanAndActualCsvSettingFixture {
  static default(override: Partial<PlanAndActualCsvSetting> = {}): PlanAndActualCsvSetting {
    return {
      start: new Date('2024-10-01T00:00:00+0900'),
      end: new Date('2024-10-01T01:00:00+0900'),
      eventType: undefined,
      ...override,
    };
  }
}
