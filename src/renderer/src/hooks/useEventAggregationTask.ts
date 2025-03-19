import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';

interface UseEventAggregationTask {
  eventAggregationTask: EventAggregationTime[];
  refreshEventAggregationTask: () => void;
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

  const refreshEventAggregationTask = React.useCallback(async (): Promise<void> => {
    try {
      if (!start || !end || !eventType) {
        return;
      }

      const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
        TYPES.EventAggregationProxy
      );
      const eventAggregationTask = await eventAggregationProxy.getAggregationByTask(
        start,
        end,
        eventType
      );
      setEventAggregationTask(eventAggregationTask);
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [start, end, eventType]);

  React.useEffect(() => {
    refreshEventAggregationTask();
  }, [refreshEventAggregationTask]);

  return {
    eventAggregationTask,
    refreshEventAggregationTask,
  };
};

export { useEventAggregationTask };
