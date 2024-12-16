import { PlanAndActualCsv } from '@main/dto/PlanAndActualCsv';
import { PlanAndActualCsvSetting } from '@shared/data/PlanAndActualCsvSetting';

export interface IPlanAndActualCsvSearchService {
  searchPlanAndActualCsv(
    planAndActualCsvSetting: PlanAndActualCsvSetting
  ): Promise<PlanAndActualCsv[]>;
}
