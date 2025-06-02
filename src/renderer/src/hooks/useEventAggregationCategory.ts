import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';

interface UseEventAggregationCategory {
  eventAggregationCategory: EventAggregationTime[];
  refreshEventAggregationCategory: () => void;
}

const logger = getLogger('useEventAggregationCategory');

const useEventAggregationCategory = (
  start?: Date,
  end?: Date,
  eventType?: EVENT_TYPE
): UseEventAggregationCategory => {
  const [eventAggregationCategory, setEventAggregationCategory] = React.useState<
    EventAggregationTime[]
  >([]);

  const refreshEventAggregationCategory = React.useCallback(async (): Promise<void> => {
    try {
      if (!start || !end || !eventType) {
        return;
      }

      const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
        TYPES.EventAggregationProxy
      );
      const eventAggregationCategory = await eventAggregationProxy.getAggregationByCategory(
        start,
        end,
        eventType
      );
      setEventAggregationCategory(eventAggregationCategory);
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [start, end, eventType]);

  React.useEffect(() => {
    refreshEventAggregationCategory();
  }, [refreshEventAggregationCategory]);

  return {
    eventAggregationCategory,
    refreshEventAggregationCategory,
  };
};

export { useEventAggregationCategory };
