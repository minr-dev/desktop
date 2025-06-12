import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';
import { AnalysisColumnData } from '@renderer/components/WorkAnalysis/AnalysisTable';

const AnalysisTableProjectHeadCells: AnalysisColumnData[] = [
  {
    key: 'name',
    label: 'プロジェクト名',
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

interface AnalysisTableProjectColumns {
  totalPlanInPeriod: EventAggregationTime[];
  totalActualInPeriod: EventAggregationTime[];
  betweenPlanAndActualInPeriod: EventAggregationTime[];
}

interface AnalysisTableProject {
  headCells: AnalysisColumnData[];
  records: Record<string, string | number>[];
}

interface UseEventAggregationProject {
  eventAggregationProject: EventAggregationTime[];
  analysisTableProject: AnalysisTableProject;
  refreshEventAggregationProject: () => void;
  refreshAnalysisTableProject: () => void;
}

const useEventAggregationProject = (
  start?: Date,
  end?: Date,
  eventType?: EVENT_TYPE
): UseEventAggregationProject => {
  const [eventAggregationProject, setEventAggregationProject] = React.useState<
    EventAggregationTime[]
  >([]);
  const [analysisTableProject, setAnalysisTableProject] = React.useState<AnalysisTableProject>({
    headCells: AnalysisTableProjectHeadCells,
    records: [],
  });

  const refreshEventAggregationProject = React.useCallback(async (): Promise<void> => {
    if (!start || !end || !eventType) {
      return;
    }

    const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
      TYPES.EventAggregationProxy
    );
    const eventAggregationProject = await eventAggregationProxy.getAggregationByProject({
      start: start,
      end: end,
      eventType: eventType,
    });
    setEventAggregationProject(eventAggregationProject);
  }, [start, end, eventType]);

  const refreshAnalysisTableProject = React.useCallback(async (): Promise<void> => {
    if (!start || !end) {
      return;
    }

    const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
      TYPES.EventAggregationProxy
    );
    const totalPlanInPeriod = await eventAggregationProxy.getAggregationByProject({
      start: start,
      end: end,
      eventType: EVENT_TYPE.PLAN,
    });
    const totalActualInPeriod = await eventAggregationProxy.getAggregationByProject({
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

    const tableData = (dataSet: AnalysisTableProjectColumns): Record<string, string | number>[] => {
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

    setAnalysisTableProject({
      headCells: AnalysisTableProjectHeadCells,
      records: records,
    });
  }, [start, end]);

  React.useEffect(() => {
    refreshEventAggregationProject();
    refreshAnalysisTableProject();
  }, [refreshEventAggregationProject, refreshAnalysisTableProject]);

  return {
    eventAggregationProject,
    analysisTableProject,
    refreshEventAggregationProject,
    refreshAnalysisTableProject,
  };
};

export { useEventAggregationProject };
