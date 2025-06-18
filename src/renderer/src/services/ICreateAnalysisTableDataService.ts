import { AnalysisTableData } from '@shared/data/AnalysisTableData';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';

export interface CreateAnalysisTableDataParams {
  nameColumnTitle: string;
  totalPlanInPeriod?: EventAggregationTime[];
  totalActualInPeriod?: EventAggregationTime[];
  totalPlan?: EventAggregationTime[];
  totalActual?: EventAggregationTime[];
}

export interface ICreateAnalysisTableDataService {
  createAnalysisTableData(params: CreateAnalysisTableDataParams): AnalysisTableData;
}
