import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { TYPES } from '@renderer/types';
import { IEventAggregationLabelUsageProxy } from '@renderer/services/IEventAggregationLabelUsageProxy';

interface UseEventAggregationLabelUsage {
  eventAggregationLabelUsage: EventAggregationTime[];
  refreshEventAggregationLabelUsage: () => void;
}

const logger = getLogger('useEventAggregationLabelUsage');

const useEventAggregationLabelUsage = (
  start?: Date,
  end?: Date,
  eventType?: EVENT_TYPE | undefined
): UseEventAggregationLabelUsage => {
  const [eventAggregationLabelUsage, setEventAggregationLabelUsage] = React.useState<
    EventAggregationTime[]
  >([]);

  const refreshEventAggregationLabelUsage = React.useCallback(async (): Promise<void> => {
    try {
      if (!start || !end || !eventType) {
        return;
      }

      const eventAggregationLabelUsageProxy =
        rendererContainer.get<IEventAggregationLabelUsageProxy>(
          TYPES.EventAggregationLabelUsageProxy
        );
      const eventAggregationLabelUsage = await eventAggregationLabelUsageProxy.get(
        start,
        end,
        eventType
      );
      setEventAggregationLabelUsage(eventAggregationLabelUsage);
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [start, end, eventType]);

  React.useEffect(() => {
    refreshEventAggregationLabelUsage();
  }, [refreshEventAggregationLabelUsage]);

  return {
    eventAggregationLabelUsage,
    refreshEventAggregationLabelUsage,
  };
};

export { useEventAggregationLabelUsage };
