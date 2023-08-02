import React from 'react';

import rendererContainer from '@renderer/inversify.config';
import { TYPES } from '@renderer/types';
import { add as addDate } from 'date-fns';
import { IEventService } from '@renderer/services/IEventService';
import { ScheduleEvent } from '@shared/dto/ScheduleEvent';

interface UseScheduleEventsResult {
  events: ScheduleEvent[] | null;
  updateEvents: (updatedEvent: ScheduleEvent) => void;
  addEvent: (newEvent: ScheduleEvent) => void;
  deleteEvent: (deletedId: string) => void;
}

// TODO あとで preference で設定できるようにする
const START_HOUR = 6;

const useScheduleEvents = (targetDate: Date): UseScheduleEventsResult => {
  const [events, setEvents] = React.useState<ScheduleEvent[] | null>(null);

  const updateEvents = (updatedEvent: ScheduleEvent): void => {
    setEvents((prevEvents) =>
      prevEvents
        ? prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
        : null
    );
  };

  const addEvent = (newEvent: ScheduleEvent): void => {
    setEvents((prevEvents) => (prevEvents ? [...prevEvents, newEvent] : null));
  };

  const deleteEvent = (deletedId: string): void => {
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

        const eventService = rendererContainer.get<IEventService>(TYPES.EventService);
        const fetchedEvents = await eventService.fetchEvents(startDate, endDate);

        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Failed to load user preference', error);
      }
    };
    fetch();
  }, [targetDate]);

  return { events, updateEvents, addEvent, deleteEvent };
};

export { useScheduleEvents };
