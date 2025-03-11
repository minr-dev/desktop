import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { TYPES } from '@renderer/types';
import { IEventAggregationLabelProxy } from '@renderer/services/IEventAggregationLabelProxy';

interface UseEventAggregationLabel {
  eventAggregationLabel: EventAggregationTime[];
  refreshEventAggregationLabel: () => void;
}

const logger = getLogger('useEventAggregationLabel');

const useEventAggregationLabel = (
  start?: Date,
  end?: Date,
  eventType?: EVENT_TYPE
): UseEventAggregationLabel => {
  const [eventAggregationLabel, setEventAggregationLabel] = React.useState<EventAggregationTime[]>(
    []
  );

  const refreshEventAggregationLabel = React.useCallback(async (): Promise<void> => {
    try {
      if (!start || !end || !eventType) {
        return;
      }

      const eventAggregationLabelProxy = rendererContainer.get<IEventAggregationLabelProxy>(
        TYPES.EventAggregationLabelProxy
      );
      const eventAggregationLabel = await eventAggregationLabelProxy.get(start, end, eventType);
      setEventAggregationLabel(eventAggregationLabel);
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [start, end, eventType]);

  React.useEffect(() => {
    refreshEventAggregationLabel();
  }, [refreshEventAggregationLabel]);

  return {
    eventAggregationLabel,
    refreshEventAggregationLabel,
  };
};

export { useEventAggregationLabel };
