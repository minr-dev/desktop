export interface AnalysisTableColumns {
  key: string;
  name: string;
}

export const TOTAL_PLAN_IN_PERIOD: AnalysisTableColumns = {
  key: 'totalPlanInPeriod',
  name: '期間内の総予定時間 (分)',
};
export const TOTAL_ACTUAL_IN_PERIOD: AnalysisTableColumns = {
  key: 'totalActualInPeriod',
  name: '期間内の総実績時間 (分)',
};
export const BETWEEN_PLAN_AND_ACTUAL_IN_PERIOD: AnalysisTableColumns = {
  key: 'betweenPlanAndActualInPeriod',
  name: '期間内の予実差分時間 (分)',
};
export const TOTAL_PLAN: AnalysisTableColumns = {
  key: 'totalPlan',
  name: '総予定時間 (分)',
};
export const TOTAL_ACTUAL: AnalysisTableColumns = {
  key: 'totalActual',
  name: '総実績時間 (分)',
};
export const BETWEEN_PLAN_AND_ACTUAL: AnalysisTableColumns = {
  key: 'betweenPlanAndActual',
  name: '総予実差分時間 (分)',
};

export interface AnalysisTableData {
  headCells: AnalysisTableColumns[];
  records: Record<string, string | number>[];
}
