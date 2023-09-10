import React, { useContext } from 'react';

import rendererContainer from '@renderer/inversify.config';
import { TYPES } from '@renderer/types';
import { add as addDate } from 'date-fns';
import { EventEntry } from '@shared/dto/EventEntry';
import { IEventEntryProxy } from '@renderer/services/IEventEntryProxy';
import UserContext from '@renderer/components/UserContext';
import { EventEntryTimeCell } from '@renderer/services/EventTimeCell';
import { IOverlapEventService } from '@renderer/services/IOverlapEventService';

interface UseEventEntriesResult {
  events: EventEntry[] | null;
  overlappedEvents: EventEntryTimeCell[] | null;
  updateEventEntry: (updatedEvent: EventEntry) => void;
  addEventEntry: (newEvent: EventEntry) => void;
  deleteEventEntry: (deletedId: string) => void;
  refreshEventEntries: () => void;
}

// TODO あとで preference で設定できるようにする
const START_HOUR = 6;

const useEventEntries = (targetDate: Date): UseEventEntriesResult => {
  const { userDetails } = useContext(UserContext);
  const [events, setEvents] = React.useState<EventEntry[] | null>(null);
  const [overlappedEvents, setOverlappedEvents] = React.useState<EventEntryTimeCell[]>([]);

  const updateEventEntry = (updatedEvent: EventEntry): void => {
    setEvents((prevEvents) =>
      prevEvents
        ? prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
        : null
    );
  };

  const addEventEntry = (newEvent: EventEntry): void => {
    setEvents((prevEvents) => (prevEvents ? [...prevEvents, newEvent] : null));
  };

  const deleteEventEntry = (deletedId: string): void => {
    setEvents((prevEvents) =>
      prevEvents ? prevEvents.filter((event) => event.id !== deletedId) : null
    );
  };

  // 初期取得(再取得)
  const refreshEventEntries = React.useCallback(async (): Promise<void> => {
    if (!userDetails) {
      return;
    }
    try {
      const today = targetDate;
      const startDate = new Date(today);
      startDate.setHours(START_HOUR, 0, 0, 0);
      const endDate = addDate(startDate, { days: 1 });

      const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
      const fetchedEvents = await eventEntryProxy.list(userDetails.userId, startDate, endDate);

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
    const eventTimeCells = events
      .filter((ee) => ee.start.dateTime)
      .map((ee) => EventEntryTimeCell.fromEventEntry(ee));
    const overlapEventService = rendererContainer.get<IOverlapEventService>(
      TYPES.OverlapEventService
    );
    const overlappedEvents = overlapEventService.execute(eventTimeCells) as EventEntryTimeCell[];
    setOverlappedEvents(overlappedEvents);
  }, [events]);

  React.useEffect(() => {
    refreshEventEntries();
  }, [refreshEventEntries]);

  return {
    events,
    overlappedEvents,
    updateEventEntry,
    addEventEntry,
    deleteEventEntry,
    refreshEventEntries,
  };
};

export { useEventEntries };
