import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';
import { AnalysisColumnData } from '@renderer/components/WorkAnalysis/AnalysisTable';

const AnalysisTableTaskHeadCells: AnalysisColumnData[] = [
  {
    key: 'name',
    label: 'タスク名',
  },
  {
    key: 'totalPlanInPeriod',
    label: '期間内の総予定時間 (分)',
  },
  {
    key: 'totalActualInPeriod',
    label: '期間内の総実績時間 (分)',
  },
  {
    key: 'betweenPlanAndActualInPeriod',
    label: '期間内の予実差分時間 (分)',
  },
  {
    key: 'totalPlan',
    label: '総予定時間 (分)',
  },
  {
    key: 'totalActual',
    label: '総実績時間 (分)',
  },
  {
    key: 'betweenPlanAndActual',
    label: '総予実差分時間 (分)',
  },
];

interface AnalysisTableTaskColumns {
  totalPlanInPeriod: EventAggregationTime[];
  totalActualInPeriod: EventAggregationTime[];
  betweenPlanAndActualInPeriod: EventAggregationTime[];
  totalPlan: EventAggregationTime[];
  totalActual: EventAggregationTime[];
  betweenPlanAndActual: EventAggregationTime[];
}

interface AnalysisTableTask {
  headCells: AnalysisColumnData[];
  records: Record<string, string | number>[];
}

interface UseEventAggregationTask {
  eventAggregationTaskPlan: EventAggregationTime[];
  eventAggregationTaskActual: EventAggregationTime[];
  analysisTableTask: AnalysisTableTask;
  refreshEventAggregationTask: () => void;
  refreshAnalysisTableTask: () => void;
}

const useEventAggregationTask = (start?: Date, end?: Date): UseEventAggregationTask => {
  const [eventAggregationTaskPlan, setEventAggregationTaskPlan] = React.useState<
    EventAggregationTime[]
  >([]);
  const [eventAggregationTaskActual, setEventAggregationTaskActual] = React.useState<
    EventAggregationTime[]
  >([]);
  const [analysisTableTask, setAnalysisTableTask] = React.useState<AnalysisTableTask>({
    headCells: AnalysisTableTaskHeadCells,
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
  }, [start, end]);

  const refreshAnalysisTableTask = React.useCallback(async (): Promise<void> => {
    if (!start || !end) {
      return;
    }

    const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
      TYPES.EventAggregationProxy
    );
    const totalPlanInPeriod = await eventAggregationProxy.getAggregationByTask({
      start: start,
      end: end,
      eventType: EVENT_TYPE.PLAN,
    });
    const totalActualInPeriod = await eventAggregationProxy.getAggregationByTask({
      start: start,
      end: end,
      eventType: EVENT_TYPE.ACTUAL,
    });
    const totalPlan = await eventAggregationProxy.getAggregationByTask({
      eventType: EVENT_TYPE.PLAN,
    });
    const totalActual = await eventAggregationProxy.getAggregationByTask({
      eventType: EVENT_TYPE.ACTUAL,
    });

    const betweenTimes = (
      minuendData: EventAggregationTime[],
      subtrahendData: EventAggregationTime[]
    ): EventAggregationTime[] => {
      const nameList = Array.from(
        new Set([...minuendData, ...subtrahendData].map((event) => event.name))
      );
      const betweenTimes: EventAggregationTime[] = [];
      nameList.forEach((name) => {
        const minuend = minuendData.find((data) => data.name === name);
        const subtrahend = subtrahendData.find((data) => data.name === name);

        const minuendTime = minuend ? minuend.aggregationTime : 0;
        const subtrahendTime = subtrahend ? subtrahend.aggregationTime : 0;
        const betweenTime = minuendTime - subtrahendTime;

        betweenTimes.push({
          name: name,
          aggregationTime: betweenTime,
        });
      });
      return betweenTimes;
    };

    const betweenPlanAndActualInPeriod = betweenTimes(totalPlanInPeriod, totalActualInPeriod);
    const betweenPlanAndActual = betweenTimes(totalPlan, totalActual);

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
      totalPlanInPeriod: totalPlanInPeriod,
      totalActualInPeriod: totalActualInPeriod,
      betweenPlanAndActualInPeriod: betweenPlanAndActualInPeriod,
      totalPlan: totalPlan,
      totalActual: totalActual,
      betweenPlanAndActual: betweenPlanAndActual,
    });

    setAnalysisTableTask({
      headCells: AnalysisTableTaskHeadCells,
      records: records,
    });
  }, [start, end]);

  React.useEffect(() => {
    refreshEventAggregationTask();
    refreshAnalysisTableTask();
  }, [refreshEventAggregationTask, refreshAnalysisTableTask]);

  return {
    eventAggregationTaskPlan,
    eventAggregationTaskActual,
    analysisTableTask,
    refreshEventAggregationTask,
    refreshAnalysisTableTask,
  };
};

export { useEventAggregationTask };
