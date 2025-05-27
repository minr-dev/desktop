import { useCallback, useContext, useEffect, useState } from 'react';

import rendererContainer from '@renderer/inversify.config';
import { TYPES } from '@renderer/types';
import AppContext from '@renderer/components/AppContext';
import { PlanTemplateEventTimeCell } from '@renderer/services/EventTimeCell';
import { IOverlapEventService } from '@renderer/services/IOverlapEventService';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';
import { IPlanTemplateEventProxy } from '@renderer/services/IPlanTemplateEventProxy';
import { useUserPreference } from './useUserPreference';

interface UsePlanTemplateEventsResult {
  events: PlanTemplateEvent[] | null;
  overlappedEvents: PlanTemplateEventTimeCell[] | null;
  updateEvent: (updatedEvent: PlanTemplateEvent) => void;
  addEvent: (newEvent: PlanTemplateEvent) => void;
  upsertEvent: (event: PlanTemplateEvent) => void;
  deleteEvent: (deletedId: string) => void;
  refreshEvents: () => void;
}

const logger = getLogger('usePlanTemplateEvents');

const usePlanTemplateEvents = (templateId: string | null): UsePlanTemplateEventsResult => {
  const { userDetails } = useContext(AppContext);
  const { userPreference } = useUserPreference();
  const startHourLocal = userPreference?.startHourLocal;
  const [events, setEvents] = useState<PlanTemplateEvent[] | null>(null);
  const [overlappedEvents, setOverlappedEvents] = useState<PlanTemplateEventTimeCell[]>([]);

  const updateEvent = (updatedEvent: PlanTemplateEvent): void => {
    setEvents((prevEvents) => {
      if (prevEvents == null) {
        return null;
      }
      return prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event));
    });
  };

  const addEvent = (newEvent: PlanTemplateEvent): void => {
    setEvents((prevEvents) => (prevEvents != null ? [...prevEvents, newEvent] : null));
  };

  const upsertEvent = (event: PlanTemplateEvent): void => {
    setEvents((prevEvents) => {
      if (prevEvents == null) {
        return null;
      }
      const isUpdate = prevEvents.some((e) => e.id === event.id);
      if (isUpdate) {
        return prevEvents.map((e) => (e.id === event.id ? event : e));
      } else {
        return [...prevEvents, event];
      }
    });
  };

  const deleteEvent = (deletedId: string): void => {
    setEvents((prevEvents) =>
      prevEvents ? prevEvents.filter((event) => event.id !== deletedId) : null
    );
  };

  // 初期取得(再取得)
  const refreshEvents = useCallback(async (): Promise<void> => {
    const userId = userDetails?.userId;
    if (!userId) {
      return;
    }
    if (!templateId) {
      setEvents([]);
      return;
    }
    try {
      const planTemplateEventProxy = rendererContainer.get<IPlanTemplateEventProxy>(
        TYPES.PlanTemplateEventProxy
      );
      const fetchedEvents = await planTemplateEventProxy.list(userId, templateId);

      setEvents(fetchedEvents.filter((event) => !event.deleted));
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [templateId, userDetails?.userId]);

  // events が更新されたら重なりを再計算する
  useEffect(() => {
    if (events === null || startHourLocal == null) {
      return;
    }
    const planEventTimeCells = events.flatMap((event) =>
      PlanTemplateEventTimeCell.fromPlanTemplateEvent(event, startHourLocal)
    );
    const overlapEventService = rendererContainer.get<IOverlapEventService>(
      TYPES.OverlapEventService
    );
    const overlappedPlanEvents = overlapEventService.execute(planEventTimeCells);
    setOverlappedEvents(overlappedPlanEvents);
  }, [events, startHourLocal]);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  return {
    events,
    overlappedEvents,
    updateEvent,
    addEvent,
    upsertEvent,
    deleteEvent,
    refreshEvents,
  };
};

export { usePlanTemplateEvents };
