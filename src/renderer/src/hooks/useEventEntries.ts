import React from 'react';

import rendererContainer from '@renderer/inversify.config';
import { TYPES } from '@renderer/types';
import { add as addDate } from 'date-fns';
import { EventEntry } from '@shared/dto/EventEntry';
import { IEventEntryProxy } from '@renderer/services/IEventEntryProxy';

interface UseEventEntriesResult {
  events: EventEntry[] | null;
  updateEventEntry: (updatedEvent: EventEntry) => void;
  addEventEntry: (newEvent: EventEntry) => void;
  deleteEventEntry: (deletedId: string) => void;
}

// TODO あとで preference で設定できるようにする
const START_HOUR = 6;

const useEventEntries = (targetDate: Date): UseEventEntriesResult => {
  const [events, setEvents] = React.useState<EventEntry[] | null>(null);

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

  React.useEffect(() => {
    const fetch = async (): Promise<void> => {
      try {
        const today = targetDate;
        const startDate = new Date(today);
        startDate.setHours(START_HOUR, 0, 0, 0);
        const endDate = addDate(startDate, { days: 1 });

        const proxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
        const fetchedEvents = await proxy.list(startDate, endDate);

        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Failed to load user preference', error);
      }
    };
    fetch();
  }, [targetDate]);

  return {
    events,
    updateEventEntry,
    addEventEntry,
    deleteEventEntry,
  };
};

export { useEventEntries };