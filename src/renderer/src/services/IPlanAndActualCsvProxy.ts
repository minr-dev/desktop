import { PlanAndActualCsvSetting } from '@shared/data/PlanAndActualCsvSetting';

export interface IPlanAndActualCsvProxy {
  createCsv(planAndActualCsvSetting: PlanAndActualCsvSetting): Promise<string>;
}
