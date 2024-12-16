import { PlanAndActualCsv } from '@main/dto/PlanAndActualCsv';
import { IPlanAndActualCsvSearchService } from '@main/services/IPlanAndActualCsvSearchService';
import { PlanAndActualCsvSetting } from '@shared/data/PlanAndActualCsvSetting';

export class PlanAndActualCsvSearchServiceMockBuilder {
  private searchPlanAndActualCsv: jest.MockedFunction<
    (planAndActualCsvSetting: PlanAndActualCsvSetting) => Promise<PlanAndActualCsv[]>
  > = jest.fn();

  withSearchPlanAndActualCsv(result: PlanAndActualCsv[]): PlanAndActualCsvSearchServiceMockBuilder {
    this.searchPlanAndActualCsv.mockResolvedValue(result);
    return this;
  }

  build(): IPlanAndActualCsvSearchService {
    const mock: IPlanAndActualCsvSearchService = {
      searchPlanAndActualCsv: this.searchPlanAndActualCsv,
    };
    return mock;
  }
}
