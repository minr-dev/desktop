import React from 'react';

import rendererContainer from '@renderer/inversify.config';
import { TYPES } from '@renderer/types';
import { add as addDate } from 'date-fns';
import { IActivityEventProxy } from '@renderer/services/IActivityEventProxy';
import { ActivityEvent } from '@shared/dto/ActivityEvent';
import { GitHubEvent } from '@shared/dto/GitHubEvent';
import { IGitHubEventProxy } from '@renderer/services/IGitHubEventProxy';
import {
  ActivityEventTimeCell,
  EventTimeCell,
  GitHubEventTimeCell,
} from '@renderer/services/EventTimeCell';
import { IOverlapEventService } from '@renderer/services/IOverlapEventService';

interface UseActivityEventsResult {
  activityEvents: ActivityEvent[] | null;
  githubEvents: GitHubEvent[] | null;
  overlappedEvents: EventTimeCell[];
  updateActivityEvents: (updatedEvent: ActivityEvent) => void;
  addActivityEvent: (newEvent: ActivityEvent) => void;
  refreshActivityEntries: () => void;
}

// TODO あとで preference で設定できるようにする
const START_HOUR = 6;

// アクティビティをポーリングする間隔
const ACTIVITY_POLLING_INTERVAL = 30 * 1000;

const useActivityEvents = (targetDate: Date): UseActivityEventsResult => {
  const [activityEvents, setActivityEvents] = React.useState<ActivityEvent[] | null>(null);
  const [githubEvents, setGitHubEvents] = React.useState<GitHubEvent[] | null>(null);
  const [overlappedEvents, setOverlappedEvents] = React.useState<EventTimeCell[]>([]);

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
      const today = targetDate;
      const startDate = new Date(today);
      startDate.setHours(START_HOUR, 0, 0, 0);
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
      console.error('Failed to load user preference', error);
    }
  }, [targetDate]);

  // events が更新されたら重なりを再計算する
  React.useEffect(() => {
    let eventTimeCells: EventTimeCell[] = [];
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
    // console.log(eventTimeCells);
    const overlappedEvents = overlapEventService.execute(eventTimeCells);
    setOverlappedEvents(overlappedEvents);
  }, [activityEvents, githubEvents]);

  React.useEffect(() => {
    // アクティビティをポーリング
    const intervalId = setInterval(() => {
      refreshActivityEntries();
    }, ACTIVITY_POLLING_INTERVAL);

    refreshActivityEntries();

    return () => {
      // コンポーネントのアンマウント時にポーリングを停止
      clearInterval(intervalId);
    };
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
