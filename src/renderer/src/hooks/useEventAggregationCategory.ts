import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';
import { AnalysisTableData } from '@shared/data/AnalysisTableData';
import { ICreateAnalysisTableDataService } from '@renderer/services/ICreateAnalysisTableDataService';

interface UseEventAggregationCategory {
  eventAggregationCategoryPlan: EventAggregationTime[];
  eventAggregationCategoryActual: EventAggregationTime[];
  analysisTableCategory: AnalysisTableData;
  refreshEventAggregationCategory: () => void;
}

const useEventAggregationCategory = (start?: Date, end?: Date): UseEventAggregationCategory => {
  const [eventAggregationCategoryPlan, setEventAggregationCategoryPlan] = React.useState<
    EventAggregationTime[]
  >([]);
  const [eventAggregationCategoryActual, setEventAggregationCategoryActual] = React.useState<
    EventAggregationTime[]
  >([]);
  const [analysisTableCategory, setAnalysisTableCategory] = React.useState<AnalysisTableData>({
    headCells: [],
    records: [],
  });

  const refreshEventAggregationCategory = React.useCallback(async (): Promise<void> => {
    if (!start || !end) {
      return;
    }

    const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
      TYPES.EventAggregationProxy
    );
    const eventAggregationCategoryPlan = await eventAggregationProxy.getAggregationByCategory({
      start: start,
      end: end,
      eventType: EVENT_TYPE.PLAN,
    });
    const eventAggregationCategoryActual = await eventAggregationProxy.getAggregationByCategory({
      start: start,
      end: end,
      eventType: EVENT_TYPE.ACTUAL,
    });
    setEventAggregationCategoryPlan(eventAggregationCategoryPlan);
    setEventAggregationCategoryActual(eventAggregationCategoryActual);

    const eventAnalysisTableService = rendererContainer.get<ICreateAnalysisTableDataService>(
      TYPES.CreateAnalysisTableDataService
    );
    setAnalysisTableCategory(
      eventAnalysisTableService.createAnalysisTableData({
        nameColumnTitle: 'カテゴリ名',
        totalPlanInPeriod: eventAggregationCategoryPlan,
        totalActualInPeriod: eventAggregationCategoryActual,
      })
    );
  }, [start, end]);

  React.useEffect(() => {
    refreshEventAggregationCategory();
  }, [refreshEventAggregationCategory]);

  return {
    eventAggregationCategoryPlan,
    eventAggregationCategoryActual,
    analysisTableCategory,
    refreshEventAggregationCategory,
  };
};

export { useEventAggregationCategory };
