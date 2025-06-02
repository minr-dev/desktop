import React from 'react';

import rendererContainer from '@renderer/inversify.config';
import { TYPES } from '@renderer/types';
import { add as addDate } from 'date-fns';
import { IActivityEventProxy } from '@renderer/services/IActivityEventProxy';
import { ActivityEvent } from '@shared/data/ActivityEvent';
import { GitHubEvent } from '@shared/data/GitHubEvent';
import { IGitHubEventProxy } from '@renderer/services/IGitHubEventProxy';
import {
  ActivityEventTimeCell,
  ActivityLaneEventTimeCell,
  GitHubEventTimeCell,
} from '@renderer/services/EventTimeCell';
import { IOverlapEventService } from '@renderer/services/IOverlapEventService';
import { getLogger } from '@renderer/utils/LoggerUtil';

interface UseActivityEventsResult {
  activityEvents: ActivityEvent[] | null;
  githubEvents: GitHubEvent[] | null;
  overlappedEvents: ActivityLaneEventTimeCell[];
  updateActivityEvents: (updatedEvent: ActivityEvent) => void;
  addActivityEvent: (newEvent: ActivityEvent) => void;
  refreshActivityEntries: () => void;
}

const logger = getLogger('useActivityEvents');

const useActivityEvents = (targetDate?: Date): UseActivityEventsResult => {
  const [activityEvents, setActivityEvents] = React.useState<ActivityEvent[] | null>(null);
  const [githubEvents, setGitHubEvents] = React.useState<GitHubEvent[] | null>(null);
  const [overlappedEvents, setOverlappedEvents] = React.useState<ActivityLaneEventTimeCell[]>([]);

  const updateActivityEvents = (updatedEvent: ActivityEvent): void => {
    setActivityEvents((prevEvents) =>
      prevEvents
        ? prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
        : null
    );
  };

  const addActivityEvent = (newEvent: ActivityEvent): void => {
    setActivityEvents((prevEvents) => (prevEvents ? [...prevEvents, newEvent] : null));
  };

  // 初期取得(再取得)
  const refreshActivityEntries = React.useCallback(async (): Promise<void> => {
    try {
      if (!targetDate) {
        return;
      }
      // targetDateには一日の開始時間が渡される
      const startDate = new Date(targetDate);
      const endDate = addDate(startDate, { days: 1 });

      const activityEventProxy = rendererContainer.get<IActivityEventProxy>(
        TYPES.ActivityEventProxy
      );
      const activityEvents = await activityEventProxy.list(startDate, endDate);
      setActivityEvents(activityEvents);

      const githubEventProxy = rendererContainer.get<IGitHubEventProxy>(TYPES.GitHubEventProxy);
      const githubEvents = await githubEventProxy.list(startDate, endDate);
      setGitHubEvents(githubEvents);
    } catch (error) {
      logger.error('Failed to load user preference', error);
    }
  }, [targetDate]);

  // events が更新されたら重なりを再計算する
  React.useEffect(() => {
    let eventTimeCells: ActivityLaneEventTimeCell[] = [];
    if (activityEvents !== null) {
      eventTimeCells = activityEvents.map((ee) => ActivityEventTimeCell.fromActivityEvent(ee));
    }
    if (githubEvents !== null) {
      const events = githubEvents.map((ee) => GitHubEventTimeCell.fromGitHubEvent(ee));
      eventTimeCells = eventTimeCells.concat(events);
    }
    const overlapEventService = rendererContainer.get<IOverlapEventService>(
      TYPES.OverlapEventService
    );
    // eventTimeCells = eventTimeCells.slice(0, 10);
    const overlappedEvents = overlapEventService.execute(eventTimeCells);
    setOverlappedEvents(overlappedEvents);
  }, [activityEvents, githubEvents]);

  React.useEffect(() => {
    refreshActivityEntries();
  }, [refreshActivityEntries]);

  return {
    activityEvents,
    githubEvents,
    overlappedEvents,
    updateActivityEvents,
    addActivityEvent,
    refreshActivityEntries,
  };
};

export { useActivityEvents };
