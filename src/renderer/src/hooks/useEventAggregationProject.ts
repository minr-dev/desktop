import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';
import { AnalysisTableData } from '@shared/data/AnalysisTableData';
import { ICreateAnalysisTableDataService } from '@renderer/services/ICreateAnalysisTableDataService';

interface UseEventAggregationProject {
  eventAggregationProjectPlan: EventAggregationTime[];
  eventAggregationProjectActual: EventAggregationTime[];
  analysisTableProject: AnalysisTableData;
  refreshEventAggregationProject: () => void;
}

const useEventAggregationProject = (start?: Date, end?: Date): UseEventAggregationProject => {
  const [eventAggregationProjectPlan, setEventAggregationProjectPlan] = React.useState<
    EventAggregationTime[]
  >([]);
  const [eventAggregationProjectActual, setEventAggregationProjectActual] = React.useState<
    EventAggregationTime[]
  >([]);
  const [analysisTableProject, setAnalysisTableProject] = React.useState<AnalysisTableData>({
    headCells: [],
    records: [],
  });

  const refreshEventAggregationProject = React.useCallback(async (): Promise<void> => {
    if (!start || !end) {
      return;
    }

    const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
      TYPES.EventAggregationProxy
    );
    const eventAggregationProjectPlan = await eventAggregationProxy.getAggregationByProject({
      start: start,
      end: end,
      eventType: EVENT_TYPE.PLAN,
    });
    const eventAggregationProjectActual = await eventAggregationProxy.getAggregationByProject({
      start: start,
      end: end,
      eventType: EVENT_TYPE.ACTUAL,
    });
    setEventAggregationProjectPlan(eventAggregationProjectPlan);
    setEventAggregationProjectActual(eventAggregationProjectActual);

    const eventAnalysisTableService = rendererContainer.get<ICreateAnalysisTableDataService>(
      TYPES.CreateAnalysisTableDataService
    );
    setAnalysisTableProject(
      eventAnalysisTableService.createAnalysisTableData({
        nameColumnTitle: 'プロジェクト名',
        totalPlanInPeriod: eventAggregationProjectPlan,
        totalActualInPeriod: eventAggregationProjectActual,
      })
    );
  }, [start, end]);

  React.useEffect(() => {
    refreshEventAggregationProject();
  }, [refreshEventAggregationProject]);

  return {
    eventAggregationProjectPlan,
    eventAggregationProjectActual,
    analysisTableProject,
    refreshEventAggregationProject,
  };
};

export { useEventAggregationProject };
