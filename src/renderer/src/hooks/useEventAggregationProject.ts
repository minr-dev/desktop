import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';

interface UseEventAggregationProject {
  eventAggregationProjectPlan: EventAggregationTime[];
  eventAggregationProjectActual: EventAggregationTime[];
  refreshEventAggregationProject: () => void;
}

const logger = getLogger('useEventAggregationProject');

const useEventAggregationProject = (start?: Date, end?: Date): UseEventAggregationProject => {
  const [eventAggregationProjectPlan, setEventAggregationProjectPlan] = React.useState<
    EventAggregationTime[]
  >([]);
  const [eventAggregationProjectActual, setEventAggregationProjectActual] = React.useState<
    EventAggregationTime[]
  >([]);

  const refreshEventAggregationProject = React.useCallback(async (): Promise<void> => {
    try {
      if (!start || !end) {
        return;
      }

      const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
        TYPES.EventAggregationProxy
      );
      const eventAggregationProjectPlan = await eventAggregationProxy.getAggregationByProject(
        start,
        end,
        EVENT_TYPE.PLAN
      );
      const eventAggregationProjectActual = await eventAggregationProxy.getAggregationByProject(
        start,
        end,
        EVENT_TYPE.ACTUAL
      );
      setEventAggregationProjectPlan(eventAggregationProjectPlan);
      setEventAggregationProjectActual(eventAggregationProjectActual);
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [start, end]);

  React.useEffect(() => {
    refreshEventAggregationProject();
  }, [refreshEventAggregationProject]);

  return {
    eventAggregationProjectPlan,
    eventAggregationProjectActual,
    refreshEventAggregationProject,
  };
};

export { useEventAggregationProject };
