import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';
import { AnalysisTableData } from '@shared/data/AnalysisTableData';
import { ICreateAnalysisTableDataService } from '@renderer/services/ICreateAnalysisTableDataService';

interface UseEventAggregationLabel {
  eventAggregationLabelPlan: EventAggregationTime[];
  eventAggregationLabelActual: EventAggregationTime[];
  analysisTableLabel: AnalysisTableData;
  refreshEventAggregationLabel: () => void;
  refreshAnalysisTableLabel: () => void;
}

const useEventAggregationLabel = (start?: Date, end?: Date): UseEventAggregationLabel => {
  const [eventAggregationLabelPlan, setEventAggregationLabelPlan] = React.useState<
    EventAggregationTime[]
  >([]);
  const [eventAggregationLabelActual, setEventAggregationLabelActual] = React.useState<
    EventAggregationTime[]
  >([]);
  const [analysisTableLabel, setAnalysisTableLabel] = React.useState<AnalysisTableData>({
    headCells: [],
    records: [],
  });

  const refreshEventAggregationLabel = React.useCallback(async (): Promise<void> => {
    if (!start || !end) {
      return;
    }

    const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
      TYPES.EventAggregationProxy
    );
    const eventAggregationLabelPlan = await eventAggregationProxy.getAggregationByLabel({
      start: start,
      end: end,
      eventType: EVENT_TYPE.PLAN,
    });
    const eventAggregationLabelActual = await eventAggregationProxy.getAggregationByLabel({
      start: start,
      end: end,
      eventType: EVENT_TYPE.ACTUAL,
    });
    setEventAggregationLabelPlan(eventAggregationLabelPlan);
    setEventAggregationLabelActual(eventAggregationLabelActual);
  }, [start, end]);

  const refreshAnalysisTableLabel = React.useCallback(async (): Promise<void> => {
    if (!start || !end) {
      return;
    }

    const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
      TYPES.EventAggregationProxy
    );
    const totalPlanInPeriod = await eventAggregationProxy.getAggregationByLabel({
      start: start,
      end: end,
      eventType: EVENT_TYPE.PLAN,
    });
    const totalActualInPeriod = await eventAggregationProxy.getAggregationByLabel({
      start: start,
      end: end,
      eventType: EVENT_TYPE.ACTUAL,
    });

    const eventAnalysisTableService = rendererContainer.get<ICreateAnalysisTableDataService>(
      TYPES.CreateAnalysisTableDataService
    );
    setAnalysisTableLabel(
      eventAnalysisTableService.createAnalysisTableData({
        nameColumnTitle: 'ラベル名',
        totalPlanInPeriod: totalPlanInPeriod,
        totalActualInPeriod: totalActualInPeriod,
      })
    );
  }, [start, end]);

  React.useEffect(() => {
    refreshEventAggregationLabel();
    refreshAnalysisTableLabel();
  }, [refreshEventAggregationLabel, refreshAnalysisTableLabel]);

  return {
    eventAggregationLabelPlan,
    eventAggregationLabelActual,
    analysisTableLabel,
    refreshEventAggregationLabel,
    refreshAnalysisTableLabel,
  };
};

export { useEventAggregationLabel };
