import { PlanAndActualCsvSetting } from '@shared/data/PlanAndActualCsvSetting';

export interface IPlanAndActualCsvService {
  createCsv(planAndActualCsvSetting: PlanAndActualCsvSetting): Promise<string>;
}
