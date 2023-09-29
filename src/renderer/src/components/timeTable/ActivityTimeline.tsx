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
import { useEffect, useState } from 'react';
import { Card, CardContent, Chip, Typography } from '@mui/material';

interface ActivityTimelineProps {
  selectedDate: Date;
  startTime: Date;
  endTime: Date;
}

export const ActivityTimeline = ({
  selectedDate,
  startTime: defaultStartTime,
  endTime: defaultEndTime,
}: ActivityTimelineProps): JSX.Element => {
  console.log('ActivityTimeline', defaultStartTime, defaultEndTime);
  const { activityEvents } = useActivityEvents(selectedDate);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [startTime, setStartTime] = useState<number>(defaultStartTime.getTime());
  const [endTime, setEndTime] = useState<number>(defaultEndTime.getTime());

  useEffect(() => {
    setStartTime(defaultStartTime.getTime());
    setEndTime(defaultEndTime.getTime());
  }, [defaultStartTime, defaultEndTime]);

  useEffect(() => {
    console.log('useEffect', startTime, endTime, activityEvents);
    if (activityEvents) {
      const newEvents = activityEvents.filter((e) => {
        return e.end.getTime() >= startTime && e.start.getTime() <= endTime;
      });
      console.log('newEvents', newEvents);
      setEvents(newEvents);
    }
  }, [activityEvents, startTime, endTime]);

  let lastEvent: ActivityEvent | null = null;
  if (events.length > 0) {
    lastEvent = events[events.length - 1];
  }

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" component="div">
            アクティビティ
          </Typography>
          <Timeline
            sx={{
              [`& .${timelineOppositeContentClasses.root}`]: {
                flex: 0.2,
              },
              padding: 0,
              marginLeft: '-1rem',
              marginRight: '-1rem',
            }}
          >
            {events.map((event) => (
              <TimelineItem key={event.id}>
                <TimelineOppositeContent color="textSecondary">
                  {format(event.start, 'HH:mm')}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot style={{ backgroundColor: event.appColor || 'default' }} />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="subtitle1">{event.basename}</Typography>
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
                      .replace('hours', '時間')
                      .replace('hour', '時間')
                      .replace('minutes', '分')
                      .replace('minute', '分')
                      .replace('seconds', '秒')
                      .replace('second', '秒');
                    return (
                      <>
                        <Typography key={`title-${index}`} variant="body2" component="div">
                          <Chip
                            label={durationStr}
                            size="small"
                            variant="outlined"
                            sx={{ marginRight: '0.5rem' }}
                          />
                          {d.windowTitle}
                        </Typography>
                      </>
                    );
                  })}
                </TimelineContent>
              </TimelineItem>
            ))}
            {lastEvent && (
              <TimelineItem>
                <TimelineOppositeContent color="textSecondary">
                  {format(lastEvent.end, 'HH:mm')}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot style={{ backgroundColor: lastEvent.appColor || 'default' }} />
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
