import React from 'react';
import rendererContainer from '@renderer/inversify.config';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { TYPES } from '@renderer/types';
import { IEventAggregationProxy } from '@renderer/services/IEventAggregationProxy';

interface UseEventAggregationCategory {
  eventAggregationCategoryPlan: EventAggregationTime[];
  eventAggregationCategoryActual: EventAggregationTime[];
  refreshEventAggregationCategory: () => void;
}

const logger = getLogger('useEventAggregationCategory');

const useEventAggregationCategory = (start?: Date, end?: Date): UseEventAggregationCategory => {
  const [eventAggregationCategoryPlan, setEventAggregationCategoryPlan] = React.useState<
    EventAggregationTime[]
  >([]);
  const [eventAggregationCategoryActual, setEventAggregationCategoryActual] = React.useState<
    EventAggregationTime[]
  >([]);

  const refreshEventAggregationCategory = React.useCallback(async (): Promise<void> => {
    try {
      if (!start || !end) {
        return;
      }

      const eventAggregationProxy = rendererContainer.get<IEventAggregationProxy>(
        TYPES.EventAggregationProxy
      );
      const eventAggregationCategoryPlan = await eventAggregationProxy.getAggregationByCategory(
        start,
        end,
        EVENT_TYPE.PLAN
      );
      const eventAggregationCategoryActual = await eventAggregationProxy.getAggregationByCategory(
        start,
        end,
        EVENT_TYPE.ACTUAL
      );
      setEventAggregationCategoryPlan(eventAggregationCategoryPlan);
      setEventAggregationCategoryActual(eventAggregationCategoryActual);
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [start, end]);

  React.useEffect(() => {
    refreshEventAggregationCategory();
  }, [refreshEventAggregationCategory]);

  return {
    eventAggregationCategoryPlan,
    eventAggregationCategoryActual,
    refreshEventAggregationCategory,
  };
};

export { useEventAggregationCategory };
