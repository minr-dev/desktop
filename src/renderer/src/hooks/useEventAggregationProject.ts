import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';

interface UseEventAggregationProject {
  eventAggregationProject: EventAggregationTime[];
  refreshEventAggregationProject: () => void;
}

const logger = getLogger('useEventAggregationProject');

const useEventAggregationProject = (
  start?: Date,
  end?: Date,
  eventType?: EVENT_TYPE
): UseEventAggregationProject => {
  const [eventAggregationProject, setEventAggregationProject] = React.useState<
    EventAggregationTime[]
  >([]);

  const refreshEventAggregationProject = React.useCallback(async (): Promise<void> => {
    try {
      if (!start || !end || !eventType) {
        return;
      }

      const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
        TYPES.EventAggregationProxy
      );
      const eventAggregationProject = await eventAggregationProxy.getAggregationByProject(
        start,
        end,
        eventType
      );
      setEventAggregationProject(eventAggregationProject);
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [start, end, eventType]);

  React.useEffect(() => {
    refreshEventAggregationProject();
  }, [refreshEventAggregationProject]);

  return {
    eventAggregationProject,
    refreshEventAggregationProject,
  };
};

export { useEventAggregationProject };
