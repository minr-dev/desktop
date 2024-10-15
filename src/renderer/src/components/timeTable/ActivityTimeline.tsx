import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import { useActivityEvents } from '@renderer/hooks/useActivityEvents';
import { ActivityEvent } from '@shared/data/ActivityEvent';
import { differenceInSeconds, format, formatDuration } from 'date-fns';
import { ForwardedRef, forwardRef, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, Chip, Typography } from '@mui/material';
import { GitHubEvent } from '@shared/data/GitHubEvent';
import { GitHubEventTimeCell } from '@renderer/services/EventTimeCell';
import GitHubIcon from '@mui/icons-material/GitHub';
import rendererContainer from '../../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

type ActivityOrGitHub = 'activity' | 'github';

/**
 * ActivityOrGitHubEvent は、アクティビティとGitHubイベントを時間でソートするために、
 * 同じ配列にまとめるための Union 用の interface である。
 */
interface ActivityOrGitHubEvent {
  id: string;
  type: ActivityOrGitHub;
  time: Date;
  activity: ActivityEvent;
  github: GitHubEvent;
}

interface ActivityTimelineProps {
  /** タイムラインを表示する日付 */
  selectedDate: Date;
  /** タイムラインのフォーカス表示開始時間 */
  focusTimeStart: Date;
  /** タイムラインのフォーカス表示終了時間 */
  focusTimeEnd: Date;
}

const loggerFactory = rendererContainer.get<ILoggerFactory>('LoggerFactory');
const logger = loggerFactory.getLogger('ActivityTimeline');

/**
 * アクティビティとGitHubイベントを一覧で表示するタイムラインコンポーネント。
 * 作業実績を記録するときに参照することを想定していて、実績を記録しようとしている時間帯に、
 * どんな作業を行っていたのかを思い出しやすくするための視覚的なサポートを目的としたコンポーネントである。
 *
 * タイムラインは、1日分のすべてのイベントを表示するが、作業実績を記録ときに、
 * 対象としている時間帯にフォーカスしやすいように、フォーカス表示時間を指定することができて、
 * 初期表示時および focusTimeStart が変更されたときに、その時間位置にスクロールする。
 * また、フォーカス表示時間から外れているイベントは、透明度を下げて表示することで、
 * 対象としている時間帯の境界がわかるようにする。
 */
export const ActivityTimeline = ({
  selectedDate,
  focusTimeStart: defaultStartTime,
  focusTimeEnd: defaultEndTime,
}: ActivityTimelineProps): JSX.Element => {
  if (logger.isDebugEnabled())
    logger.debug(
      `ActivityTimeline: defaultStartTime=${defaultStartTime}, defaultEndTime=${defaultEndTime}`
    );
  const { activityEvents, githubEvents } = useActivityEvents(selectedDate);

  const [events, setEvents] = useState<ActivityOrGitHubEvent[]>([]);
  const [focusTimeStart, setFocusTimeStart] = useState<number>(defaultStartTime.getTime());
  const [focusTimeEnd, setFocusTimeEnd] = useState<number>(defaultEndTime.getTime());

  useEffect(() => {
    setFocusTimeStart(defaultStartTime.getTime());
    setFocusTimeEnd(defaultEndTime.getTime());
  }, [defaultStartTime, defaultEndTime]);

  useEffect(() => {
    if (!activityEvents || !githubEvents) {
      return;
    }
    const activities = activityEvents.map(
      (e) => ({ id: e.id, type: 'activity', time: e.start, activity: e } as ActivityOrGitHubEvent)
    );
    const githubs = githubEvents.map(
      (e) => ({ id: e.id, type: 'github', time: e.updated_at, github: e } as ActivityOrGitHubEvent)
    );
    const merged = activities.concat(githubs).sort((a, b) => {
      return a.time.getTime() - b.time.getTime();
    });
    setEvents(merged);
  }, [activityEvents, githubEvents]);

  // 初期表示時に focusTimeStart に最も近い event の位置 にスクロールする
  // スクロール用のref
  const closestEventRef = useRef<HTMLElement | null>(null);
  // 最近似の event を求める
  const closestEvent = events.reduce((closest, current) => {
    const currentDiff = Math.abs(current.time.getTime() - focusTimeStart);
    const closestDiff = Math.abs(closest.time.getTime() - focusTimeStart);

    return currentDiff < closestDiff ? current : closest;
  }, events[0]);
  // スクロールする
  useEffect(() => {
    if (logger.isDebugEnabled()) logger.debug(`scrollIntoView: ${closestEventRef.current}`);
    if (closestEventRef.current) {
      closestEventRef.current.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [events, closestEventRef, focusTimeStart]);

  // lastEvent は、タイムラインの最後のアイテムとして終了時間を表示するためのものである。
  // events の配列を表示するところでは、イベントの開始時間と明細としての duration しか表示されないくて、
  // 一番最後のイベントが何時に終わったのかがわかりづらいため、終了時間だけを表示する。
  let lastEvent: ActivityOrGitHubEvent | null = null;
  let lastEventColor = 'default';
  let lastTime = '';
  if (events.length > 0) {
    lastEvent = events[events.length - 1];
    if (lastEvent.type === 'activity' && lastEvent.activity.appColor) {
      lastEventColor = lastEvent.activity.appColor;
    }
    lastTime = format(
      lastEvent.type === 'activity' ? lastEvent.activity.end : lastEvent.github.updated_at,
      'HH:mm'
    );
  }

  if (events.length === 0) {
    return (
      <>
        <Card variant="outlined">
          <CardHeader title="アクティビティ" />
          <CardContent>アクティビティはありません</CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card variant="outlined">
        <CardHeader title="アクティビティ" />
        <CardContent
          sx={{
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.2,
            },
            paddingTop: 0,
            marginTop: '0rem',
            maxHeight: 'calc(28rem + 4px)',
            overflowY: 'scroll',
            overflowX: 'hidden',
          }}
        >
          <Timeline
            sx={{
              [`& .${timelineOppositeContentClasses.root}`]: {
                flex: 0.2,
              },
              padding: 0,
              marginTop: '0rem',
              marginLeft: '-1rem',
              marginRight: '-1rem',
            }}
          >
            {events.map((event) => {
              const ref = event.id === closestEvent.id ? closestEventRef : null;
              if (event.type === 'activity') {
                return (
                  <ActivityTimelineItemRef
                    key={event.id}
                    event={event.activity}
                    ref={ref}
                    focusTimeStart={focusTimeStart}
                    focusTimeEnd={focusTimeEnd}
                  />
                );
              } else {
                return (
                  <GitHubTimelineItemRef
                    key={event.id}
                    event={event.github}
                    ref={ref}
                    focusTimeStart={focusTimeStart}
                    focusTimeEnd={focusTimeEnd}
                  />
                );
              }
            })}
            {lastEvent && (
              <TimelineItem>
                <TimelineOppositeContent color="textSecondary">{lastTime}</TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot style={{ backgroundColor: lastEventColor }} />
                </TimelineSeparator>
                <TimelineContent></TimelineContent>
              </TimelineItem>
            )}
          </Timeline>
        </CardContent>
      </Card>
    </>
  );
};

interface ActivityTimelineItemProps {
  event: ActivityEvent;
  focusTimeStart: number;
  focusTimeEnd: number;
}

/**
 * アクティビティイベントを表示するタイムラインアイテムコンポーネント。
 */
const ActivityTimelineItem = (
  { event, focusTimeStart, focusTimeEnd }: ActivityTimelineItemProps,
  ref?: ForwardedRef<HTMLElement>
): JSX.Element => {
  const opacity =
    event.start.getTime() < focusTimeStart || event.end.getTime() > focusTimeEnd ? 0.7 : undefined;
  return (
    <>
      <TimelineItem ref={ref} sx={{ opacity: opacity }}>
        <TimelineOppositeContent color="textSecondary">
          {format(event.start, 'HH:mm')}
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot style={{ backgroundColor: event.appColor || 'default' }} />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="subtitle1" component="div" sx={{ overflow: 'hidden' }}>
            {event.basename}
          </Typography>
          {event.details.map((d, index) => {
            const secs = differenceInSeconds(d.end, d.start);
            const mins = Math.floor(secs / 60);
            const hours = Math.floor(mins / 60);
            const duration = {
              hours: hours,
              minutes: mins % 60,
              seconds: secs % 60,
            };
            const formatOptions = { format: ['hours', 'minutes', 'seconds'] };
            const durationStr = formatDuration(duration, formatOptions)
              .replace(/hours?/, '時間')
              .replace(/minutes?/, '分')
              .replace(/seconds?/, '秒');
            return (
              <Typography key={`title-${index}`} variant="body2" component="div">
                <Chip
                  label={durationStr}
                  size="small"
                  variant="outlined"
                  sx={{ marginRight: '0.5rem' }}
                />
                {d.windowTitle}
              </Typography>
            );
          })}
        </TimelineContent>
      </TimelineItem>
    </>
  );
};
const ActivityTimelineItemRef = forwardRef(ActivityTimelineItem);
ActivityTimelineItemRef.displayName = 'ActivityTimelineItem';

interface GitHubTimelineItemProps {
  event: GitHubEvent;
  focusTimeStart: number;
  focusTimeEnd: number;
}

/**
 * GitHubイベントを表示するタイムラインアイテムコンポーネント。
 */
const GitHubTimelineItem = (
  { event, focusTimeStart, focusTimeEnd }: GitHubTimelineItemProps,
  ref?: ForwardedRef<HTMLElement>
): JSX.Element => {
  const ge = GitHubEventTimeCell.fromGitHubEvent(event);
  const opacity =
    event.updated_at.getTime() < focusTimeStart || event.updated_at.getTime() > focusTimeEnd
      ? 0.7
      : undefined;
  return (
    <>
      <TimelineItem ref={ref} sx={{ opacity: opacity }}>
        <TimelineOppositeContent color="textSecondary">
          {format(ge.startTime, 'HH:mm')}
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Typography
            variant="subtitle1"
            component="div"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <GitHubIcon sx={{ marginRight: '0.5rem' }} />
            {ge.summary}
          </Typography>
          <Typography
            variant="body2"
            component="div"
            style={{
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
            }}
          >
            {ge.description}
          </Typography>
        </TimelineContent>
      </TimelineItem>
    </>
  );
};
const GitHubTimelineItemRef = forwardRef(GitHubTimelineItem);
GitHubTimelineItemRef.displayName = 'GitHubTimelineItem';
