import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';
import { AnalysisColumnData } from '@renderer/components/WorkAnalysis/AnalysisTable';

const AnalysisTableTaskHeadCells: AnalysisColumnData[] = [
  {
    key: 'name',
    label: 'タスク名',
  },
  {
    key: 'selectedDurationPlanTime',
    label: '指定期間の予定 (分)',
  },
  {
    key: 'selectedDurationActualTime',
    label: '指定期間の実績 (分)',
  },
  {
    key: 'totalPlanTime',
    label: '全期間の予定 (分)',
  },
  {
    key: 'totalActualTime',
    label: '全期間の実績 (分)',
  },
];

interface AnalysisTableTaskColumns {
  selectedDurationPlanTime: EventAggregationTime[];
  selectedDurationActualTime: EventAggregationTime[];
  totalPlanTime: EventAggregationTime[];
  totalActualTime: EventAggregationTime[];
}

interface AnalysisTableTask {
  headCells: AnalysisColumnData[];
  records: Record<string, string | number>[];
}

interface UseEventAggregationTask {
  eventAggregationTask: EventAggregationTime[];
  analysisTableTask: AnalysisTableTask;
  refreshEventAggregationTask: () => void;
  refreshAnalysisTableTask: () => void;
}

const logger = getLogger('useEventAggregationTask');

const useEventAggregationTask = (
  start?: Date,
  end?: Date,
  eventType?: EVENT_TYPE
): UseEventAggregationTask => {
  const [eventAggregationTask, setEventAggregationTask] = React.useState<EventAggregationTime[]>(
    []
  );
  const [analysisTableTask, setAnalysisTableTask] = React.useState<AnalysisTableTask>({
    headCells: AnalysisTableTaskHeadCells,
    records: [],
  });

  const refreshEventAggregationTask = React.useCallback(async (): Promise<void> => {
    try {
      if (!start || !end || !eventType) {
        return;
      }

      const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
        TYPES.EventAggregationProxy
      );
      const eventAggregationTask = await eventAggregationProxy.getAggregationByTask({
        start: start,
        end: end,
        eventType: eventType,
      });
      setEventAggregationTask(eventAggregationTask);
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [start, end, eventType]);

  const refreshAnalysisTableTask = React.useCallback(async (): Promise<void> => {
    try {
      if (!start || !end || !eventType) {
        return;
      }

      const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
        TYPES.EventAggregationProxy
      );
      const selectedDurationPlanTime = await eventAggregationProxy.getAggregationByTask({
        start: start,
        end: end,
        eventType: EVENT_TYPE.PLAN,
      });
      const selectedDurationActualTime = await eventAggregationProxy.getAggregationByTask({
        start: start,
        end: end,
        eventType: EVENT_TYPE.ACTUAL,
      });
      const totalPlanTime = await eventAggregationProxy.getAggregationByTask({
        eventType: EVENT_TYPE.PLAN,
      });
      const totalActualTime = await eventAggregationProxy.getAggregationByTask({
        eventType: EVENT_TYPE.ACTUAL,
      });

      const tableData = (dataSet: AnalysisTableTaskColumns): Record<string, string | number>[] => {
        const mergedMap = new Map<string, Record<string, string | number>>();
        const keys = Object.keys(dataSet);

        Object.entries(dataSet).forEach(([key, dataArray]) => {
          dataArray.forEach(({ name, aggregationTime }) => {
            if (!mergedMap.has(name)) {
              mergedMap.set(name, Object.fromEntries(keys.map((k) => [k, 0])));
              mergedMap.get(name)!.name = name;
            }
            mergedMap.get(name)![key] = (aggregationTime ?? 0) / (60 * 1000);
          });
        });
        return Array.from(mergedMap.values());
      };
      const records = tableData({
        selectedDurationPlanTime: selectedDurationPlanTime,
        selectedDurationActualTime: selectedDurationActualTime,
        totalPlanTime: totalPlanTime,
        totalActualTime: totalActualTime,
      });

      setAnalysisTableTask({
        headCells: AnalysisTableTaskHeadCells,
        records: records,
      });
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [start, end, eventType]);

  React.useEffect(() => {
    refreshEventAggregationTask();
    refreshAnalysisTableTask();
  }, [refreshEventAggregationTask, refreshAnalysisTableTask]);

  return {
    eventAggregationTask,
    analysisTableTask,
    refreshEventAggregationTask,
    refreshAnalysisTableTask,
  };
};

export { useEventAggregationTask };
