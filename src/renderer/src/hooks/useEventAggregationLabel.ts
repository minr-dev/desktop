import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';

interface UseEventAggregationLabel {
  eventAggregationLabelPlan: EventAggregationTime[];
  eventAggregationLabelActual: EventAggregationTime[];
  refreshEventAggregationLabel: () => void;
}

const logger = getLogger('useEventAggregationLabel');

const useEventAggregationLabel = (start?: Date, end?: Date): UseEventAggregationLabel => {
  const [eventAggregationLabelPlan, setEventAggregationLabelPlan] = React.useState<
    EventAggregationTime[]
  >([]);
  const [eventAggregationLabelActual, setEventAggregationLabelActual] = React.useState<
    EventAggregationTime[]
  >([]);

  const refreshEventAggregationLabel = React.useCallback(async (): Promise<void> => {
    try {
      if (!start || !end) {
        return;
      }

      const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
        TYPES.EventAggregationProxy
      );
      const eventAggregationLabelPlan = await eventAggregationProxy.getAggregationByLabel(
        start,
        end,
        EVENT_TYPE.PLAN
      );
      const eventAggregationLabelActual = await eventAggregationProxy.getAggregationByLabel(
        start,
        end,
        EVENT_TYPE.ACTUAL
      );
      setEventAggregationLabelPlan(eventAggregationLabelPlan);
      setEventAggregationLabelActual(eventAggregationLabelActual);
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [start, end]);

  React.useEffect(() => {
    refreshEventAggregationLabel();
  }, [refreshEventAggregationLabel]);

  return {
    eventAggregationLabelPlan,
    eventAggregationLabelActual,
    refreshEventAggregationLabel,
  };
};

export { useEventAggregationLabel };
