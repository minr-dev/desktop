import React, { useContext } from 'react';

import rendererContainer from '@renderer/inversify.config';
import { TYPES } from '@renderer/types';
import { add as addDate, addDays } from 'date-fns';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { IEventEntryProxy } from '@renderer/services/IEventEntryProxy';
import AppContext from '@renderer/components/AppContext';
import { EventEntryTimeCell } from '@renderer/services/EventTimeCell';
import { IOverlapEventService } from '@renderer/services/IOverlapEventService';
import { AppError } from '@shared/errors/AppError';

interface UseEventEntriesResult {
  events: EventEntry[] | null;
  overlappedPlanEvents: EventEntryTimeCell[] | null;
  overlappedActualEvents: EventEntryTimeCell[] | null;
  updateEventEntry: (updatedEvents: EventEntry[]) => void;
  addEventEntry: (newEvents: EventEntry[]) => void;
  deleteEventEntry: (deletedIds: string[]) => void;
  refreshEventEntries: () => void;
}

const useEventEntries = (targetDate?: Date): UseEventEntriesResult => {
  const { userDetails } = useContext(AppContext);
  const [events, setEvents] = React.useState<EventEntry[] | null>(null);
  const [overlappedPlanEvents, setOverlappedPlanEvents] = React.useState<EventEntryTimeCell[]>([]);
  const [overlappedActualEvents, setOverlappedActualEvents] = React.useState<EventEntryTimeCell[]>(
    []
  );

  const eventInDate = (event: EventEntry): boolean => {
    if (!targetDate || !event?.start?.dateTime || !event?.end?.dateTime) {
      return false;
    }
    return event.end.dateTime >= targetDate && event.start.dateTime < addDays(targetDate, 1);
  };

  const updateEventEntry = (updatedEvents: EventEntry[]): void => {
    setEvents((prevEvents) => {
      if (!prevEvents) {
        return null;
      }
      const postEvents: EventEntry[] = [];
      for (const event of prevEvents) {
        const updatedEvent = updatedEvents.find((updatedEvent) => event.id === updatedEvent.id);
        if (updatedEvent == null) {
          postEvents.push(event);
          continue;
        }
        if (eventInDate(updatedEvent)) {
          postEvents.push(updatedEvent);
        }
      }
      return postEvents;
    });
  };

  const addEventEntry = (newEvents: EventEntry[]): void => {
    setEvents((prevEvents) => (prevEvents ? [...prevEvents, ...newEvents] : null));
  };

  const deleteEventEntry = (deletedIds: string[]): void => {
    setEvents((prevEvents) =>
      prevEvents ? prevEvents.filter((event) => !deletedIds.includes(event.id)) : null
    );
  };

  // 初期取得(再取得)
  const refreshEventEntries = React.useCallback(async (): Promise<void> => {
    if (!userDetails || !targetDate) {
      return;
    }
    try {
      // targetDateには1日の開始時間が渡される
      const startDate = new Date(targetDate);
      const endDate = addDate(startDate, { days: 1 });

      const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
      const fetchedEvents = await eventEntryProxy.list(userDetails.userId, startDate, endDate);

      // TODO: 仮登録のイベントの保持
      // 日付変更時は保持しなくてよいが、GitHubなどとの同期の時は保持されているべき
      setEvents(fetchedEvents.filter((event) => !event.deleted));
    } catch (error) {
      console.error('Failed to load user preference', error);
    }
  }, [targetDate, userDetails]);

  // events が更新されたら重なりを再計算する
  React.useEffect(() => {
    if (events === null) {
      return;
    }
    const planEventTimeCells: EventEntryTimeCell[] = [];
    const actualEventTimeCells: EventEntryTimeCell[] = [];
    for (const event of events) {
      if (!event.start.dateTime) {
        continue;
      }
      if (event.eventType === EVENT_TYPE.PLAN || event.eventType === EVENT_TYPE.SHARED) {
        planEventTimeCells.push(EventEntryTimeCell.fromEventEntry(event));
      } else if (event.eventType === EVENT_TYPE.ACTUAL) {
        actualEventTimeCells.push(EventEntryTimeCell.fromEventEntry(event));
      } else {
        throw new AppError(`Unexpected event type: ${event.eventType}`);
      }
    }
    const overlapEventService = rendererContainer.get<IOverlapEventService>(
      TYPES.OverlapEventService
    );
    const overlappedPlanEvents = overlapEventService.execute(
      planEventTimeCells
    ) as EventEntryTimeCell[];
    setOverlappedPlanEvents(overlappedPlanEvents);
    const overlappedActualEvents = overlapEventService.execute(
      actualEventTimeCells
    ) as EventEntryTimeCell[];
    setOverlappedActualEvents(overlappedActualEvents);
  }, [events]);

  React.useEffect(() => {
    refreshEventEntries();
  }, [refreshEventEntries]);

  return {
    events,
    overlappedPlanEvents,
    overlappedActualEvents,
    updateEventEntry,
    addEventEntry,
    deleteEventEntry,
    refreshEventEntries,
  };
};

export { useEventEntries };
