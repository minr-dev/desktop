import React from 'react';
import { ProcessedEvent } from '@aldabil/react-scheduler/types';

import rendererContainer from '@renderer/inversify.config';
import { TYPES } from '@renderer/types';
import { add as addDate } from 'date-fns';
import { IEventService } from '@renderer/services/IEventService';

// TODO あとで preference で設定できるようにする
const START_HOUR = 6;

const useEvents = (): ProcessedEvent[] | null => {
  const [events, setEvents] = React.useState<ProcessedEvent[] | null>(null);

  React.useEffect(() => {
    const fetch = async (): Promise<void> => {
      try {
        const today = new Date();
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
  }, []);

  return events;
};

export { useEvents };
