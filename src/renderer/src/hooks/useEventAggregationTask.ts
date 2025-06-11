import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';

interface UseEventAggregationTask {
  eventAggregationTaskPlan: EventAggregationTime[];
  eventAggregationTaskActual: EventAggregationTime[];
  refreshEventAggregationTask: () => void;
}

const logger = getLogger('useEventAggregationTask');

const useEventAggregationTask = (start?: Date, end?: Date): UseEventAggregationTask => {
  const [eventAggregationTaskPlan, setEventAggregationTaskPlan] = React.useState<
    EventAggregationTime[]
  >([]);
  const [eventAggregationTaskActual, setEventAggregationTaskActual] = React.useState<
    EventAggregationTime[]
  >([]);

  const refreshEventAggregationTask = React.useCallback(async (): Promise<void> => {
    try {
      if (!start || !end) {
        return;
      }

      const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
        TYPES.EventAggregationProxy
      );
      const eventAggregationTaskPlan = await eventAggregationProxy.getAggregationByTask(
        start,
        end,
        EVENT_TYPE.PLAN
      );
      const eventAggregationTaskActual = await eventAggregationProxy.getAggregationByTask(
        start,
        end,
        EVENT_TYPE.ACTUAL
      );
      setEventAggregationTaskPlan(eventAggregationTaskPlan);
      setEventAggregationTaskActual(eventAggregationTaskActual);
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [start, end]);

  React.useEffect(() => {
    refreshEventAggregationTask();
  }, [refreshEventAggregationTask]);

  return {
    eventAggregationTaskPlan,
    eventAggregationTaskActual,
    refreshEventAggregationTask,
  };
};

export { useEventAggregationTask };
