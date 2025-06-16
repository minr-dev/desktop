import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';
import { AnalysisColumnData } from '@renderer/components/WorkAnalysis/AnalysisTable';

const AnalysisTableLabelHeadCells: AnalysisColumnData[] = [
  {
    key: 'name',
    label: 'ラベル名',
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
];

interface AnalysisTableLabelColumns {
  totalPlanInPeriod: EventAggregationTime[];
  totalActualInPeriod: EventAggregationTime[];
  betweenPlanAndActualInPeriod: EventAggregationTime[];
}

interface AnalysisTableLabel {
  headCells: AnalysisColumnData[];
  records: Record<string, string | number>[];
}

interface UseEventAggregationLabel {
  eventAggregationLabelPlan: EventAggregationTime[];
  eventAggregationLabelActual: EventAggregationTime[];
  analysisTableLabel: AnalysisTableLabel;
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
  const [analysisTableLabel, setAnalysisTableLabel] = React.useState<AnalysisTableLabel>({
    headCells: AnalysisTableLabelHeadCells,
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

    const tableData = (dataSet: AnalysisTableLabelColumns): Record<string, string | number>[] => {
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
    });

    setAnalysisTableLabel({
      headCells: AnalysisTableLabelHeadCells,
      records: records,
    });
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
