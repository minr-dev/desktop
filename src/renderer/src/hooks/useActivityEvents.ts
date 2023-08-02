import React from 'react';

import rendererContainer from '@renderer/inversify.config';
import { TYPES } from '@renderer/types';
import { add as addDate } from 'date-fns';
import { IActivityService } from '@renderer/services/IActivityService';
import { ActivityEvent } from '@shared/dto/ActivityEvent';

interface UseActivityEventsResult {
  activityEvents: ActivityEvent[] | null;
  updateActivityEvents: (updatedEvent: ActivityEvent) => void;
  addActivityEvent: (newEvent: ActivityEvent) => void;
}

// TODO あとで preference で設定できるようにする
const START_HOUR = 6;

const useActivityEvents = (targetDate: Date): UseActivityEventsResult => {
  const [activityEvents, setEvents] = React.useState<ActivityEvent[] | null>(null);

  const updateActivityEvents = (updatedEvent: ActivityEvent): void => {
    setEvents((prevEvents) =>
      prevEvents
        ? prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
        : null
    );
  };

  const addActivityEvent = (newEvent: ActivityEvent): void => {
    setEvents((prevEvents) => (prevEvents ? [...prevEvents, newEvent] : null));
  };

  React.useEffect(() => {
    const fetch = async (): Promise<void> => {
      try {
        const today = targetDate;
        const startDate = new Date(today);
        startDate.setHours(START_HOUR, 0, 0, 0);
        const endDate = addDate(startDate, { days: 1 });

        const eventService = rendererContainer.get<IActivityService>(TYPES.ActivityService);
        const fetchedEvents = await eventService.fetchActivities(startDate, endDate);

        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Failed to load user preference', error);
      }
    };
    fetch();
  }, [targetDate]);

  return { activityEvents, updateActivityEvents, addActivityEvent };
};

export { useActivityEvents };
