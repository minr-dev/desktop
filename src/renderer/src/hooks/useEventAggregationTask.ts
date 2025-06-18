import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';
import { AnalysisTableData } from '@shared/data/AnalysisTableData';
import { ICreateAnalysisTableDataService } from '@renderer/services/ICreateAnalysisTableDataService';

interface UseEventAggregationTask {
  eventAggregationTaskPlan: EventAggregationTime[];
  eventAggregationTaskActual: EventAggregationTime[];
  analysisTableTask: AnalysisTableData;
  refreshEventAggregationTask: () => void;
}

const useEventAggregationTask = (start?: Date, end?: Date): UseEventAggregationTask => {
  const [eventAggregationTaskPlan, setEventAggregationTaskPlan] = React.useState<
    EventAggregationTime[]
  >([]);
  const [eventAggregationTaskActual, setEventAggregationTaskActual] = React.useState<
    EventAggregationTime[]
  >([]);
  const [analysisTableTask, setAnalysisTableTask] = React.useState<AnalysisTableData>({
    headCells: [],
    records: [],
  });

  const refreshEventAggregationTask = React.useCallback(async (): Promise<void> => {
    if (!start || !end) {
      return;
    }

    const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
      TYPES.EventAggregationProxy
    );
    const eventAggregationTaskPlan = await eventAggregationProxy.getAggregationByTask({
      start: start,
      end: end,
      eventType: EVENT_TYPE.PLAN,
    });
    const eventAggregationTaskActual = await eventAggregationProxy.getAggregationByTask({
      start: start,
      end: end,
      eventType: EVENT_TYPE.ACTUAL,
    });
    setEventAggregationTaskPlan(eventAggregationTaskPlan);
    setEventAggregationTaskActual(eventAggregationTaskActual);

    const totalPlan = await eventAggregationProxy.getAggregationByTask({
      eventType: EVENT_TYPE.PLAN,
    });
    const totalActual = await eventAggregationProxy.getAggregationByTask({
      eventType: EVENT_TYPE.ACTUAL,
    });

    const eventAnalysisTableService = rendererContainer.get<ICreateAnalysisTableDataService>(
      TYPES.CreateAnalysisTableDataService
    );
    setAnalysisTableTask(
      eventAnalysisTableService.createAnalysisTableData({
        nameColumnTitle: 'タスク名',
        totalPlanInPeriod: eventAggregationTaskPlan,
        totalActualInPeriod: eventAggregationTaskActual,
        totalPlan: totalPlan,
        totalActual: totalActual,
      })
    );
  }, [start, end]);

  React.useEffect(() => {
    refreshEventAggregationTask();
  }, [refreshEventAggregationTask]);

  return {
    eventAggregationTaskPlan,
    eventAggregationTaskActual,
    analysisTableTask,
    refreshEventAggregationTask,
  };
};

export { useEventAggregationTask };
