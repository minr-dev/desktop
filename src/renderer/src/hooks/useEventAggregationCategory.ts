import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';
import { AnalysisColumnData } from '@renderer/components/WorkAnalysis/AnalysisTable';

const AnalysisTableCategoryHeadCells: AnalysisColumnData[] = [
  {
    key: 'name',
    label: 'カテゴリ名',
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

interface AnalysisTableCategoryColumns {
  totalPlanInPeriod: EventAggregationTime[];
  totalActualInPeriod: EventAggregationTime[];
  betweenPlanAndActualInPeriod: EventAggregationTime[];
}

interface AnalysisTableCategory {
  headCells: AnalysisColumnData[];
  records: Record<string, string | number>[];
}

interface UseEventAggregationCategory {
  eventAggregationCategoryPlan: EventAggregationTime[];
  eventAggregationCategoryActual: EventAggregationTime[];
  analysisTableCategory: AnalysisTableCategory;
  refreshEventAggregationCategory: () => void;
  refreshAnalysisTableCategory: () => void;
}

const useEventAggregationCategory = (start?: Date, end?: Date): UseEventAggregationCategory => {
  const [eventAggregationCategoryPlan, setEventAggregationCategoryPlan] = React.useState<
    EventAggregationTime[]
  >([]);
  const [eventAggregationCategoryActual, setEventAggregationCategoryActual] = React.useState<
    EventAggregationTime[]
  >([]);
  const [analysisTableCategory, setAnalysisTableCategory] = React.useState<AnalysisTableCategory>({
    headCells: AnalysisTableCategoryHeadCells,
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
  }, [start, end]);

  const refreshAnalysisTableCategory = React.useCallback(async (): Promise<void> => {
    if (!start || !end) {
      return;
    }

    const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
      TYPES.EventAggregationProxy
    );
    const totalPlanInPeriod = await eventAggregationProxy.getAggregationByCategory({
      start: start,
      end: end,
      eventType: EVENT_TYPE.PLAN,
    });
    const totalActualInPeriod = await eventAggregationProxy.getAggregationByCategory({
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

    const tableData = (
      dataSet: AnalysisTableCategoryColumns
    ): Record<string, string | number>[] => {
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

    setAnalysisTableCategory({
      headCells: AnalysisTableCategoryHeadCells,
      records: records,
    });
  }, [start, end]);

  React.useEffect(() => {
    refreshEventAggregationCategory();
    refreshAnalysisTableCategory();
  }, [refreshEventAggregationCategory, refreshAnalysisTableCategory]);

  return {
    eventAggregationCategoryPlan,
    eventAggregationCategoryActual,
    analysisTableCategory,
    refreshEventAggregationCategory,
    refreshAnalysisTableCategory,
  };
};

export { useEventAggregationCategory };
