import { injectable } from 'inversify';
import {
  CreateAnalysisTableDataParams,
  ICreateAnalysisTableDataService,
} from './ICreateAnalysisTableDataService';
import {
  AnalysisTableColumns,
  AnalysisTableData,
  BETWEEN_PLAN_AND_ACTUAL,
  BETWEEN_PLAN_AND_ACTUAL_IN_PERIOD,
  TOTAL_ACTUAL,
  TOTAL_ACTUAL_IN_PERIOD,
  TOTAL_PLAN,
  TOTAL_PLAN_IN_PERIOD,
} from '@shared/data/AnalysisTableData';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';

@injectable()
export class CreateAnalysisTableDataServiceImpl implements ICreateAnalysisTableDataService {
  createAnalysisTableData(params: CreateAnalysisTableDataParams): AnalysisTableData {
    const { nameColumnTitle, totalPlanInPeriod, totalActualInPeriod, totalPlan, totalActual } =
      params;
    const headCells: AnalysisTableColumns[] = [
      {
        key: 'name',
        name: nameColumnTitle,
      },
    ];
    if (totalPlanInPeriod) {
      headCells.push(TOTAL_PLAN_IN_PERIOD);
    }
    if (totalActualInPeriod) {
      headCells.push(TOTAL_ACTUAL_IN_PERIOD);
    }
    if (totalPlanInPeriod && totalActualInPeriod) {
      headCells.push(BETWEEN_PLAN_AND_ACTUAL_IN_PERIOD);
    }
    if (totalPlan) {
      headCells.push(TOTAL_PLAN);
    }
    if (totalActual) {
      headCells.push(TOTAL_ACTUAL);
    }
    if (totalPlan && totalActual) {
      headCells.push(BETWEEN_PLAN_AND_ACTUAL);
    }

    const inPeriodNameList = this.getUniqueEventNameList(totalPlanInPeriod, totalActualInPeriod);
    const records: Record<string, string | number>[] = [];
    inPeriodNameList.forEach((name) => {
      const totalPlanInPeriodAggregationTime =
        totalPlanInPeriod?.find((data) => data.name === name)?.aggregationTime || 0;
      const totalActualInPeriodAggregationTime =
        totalActualInPeriod?.find((data) => data.name === name)?.aggregationTime || 0;
      const totalPlanAggregationTime =
        totalPlan?.find((data) => data.name === name)?.aggregationTime || 0;
      const totalActualAggregationTime =
        totalActual?.find((data) => data.name === name)?.aggregationTime || 0;
      records.push({
        name: name,
        [TOTAL_PLAN_IN_PERIOD.key]: totalPlanInPeriodAggregationTime / (60 * 1000),
        [TOTAL_ACTUAL_IN_PERIOD.key]: totalActualInPeriodAggregationTime / (60 * 1000),
        [BETWEEN_PLAN_AND_ACTUAL_IN_PERIOD.key]:
          (totalPlanInPeriodAggregationTime - totalActualInPeriodAggregationTime) / (60 * 1000),
        [TOTAL_PLAN.key]: totalPlanAggregationTime / (60 * 1000),
        [TOTAL_ACTUAL.key]: totalActualAggregationTime / (60 * 1000),
        [BETWEEN_PLAN_AND_ACTUAL.key]:
          (totalPlanAggregationTime - totalActualAggregationTime) / (60 * 1000),
      });
    });

    return {
      headCells: headCells,
      records: records,
    };
  }

  private getUniqueEventNameList(
    eventA?: EventAggregationTime[],
    eventB?: EventAggregationTime[]
  ): string[] {
    return Array.from(new Set([...(eventA ?? []), ...(eventB ?? [])].map((event) => event.name)));
  }
}
