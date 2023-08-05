import { EventEntry } from '@shared/dto/EventEntry';
import { EventSlot, EventSlotText } from './EventSlot';
import { TimeCell, TimeTableContainer, startHourLocal } from './common';
import { ActivitySlot, ActivityTooltipEvent } from './ActivitySlot';
import { Tooltip } from '@mui/material';
import ActivityDetailsStepper from './ActivityDetailsStepper';

interface EventTableLaneProps {
  eventEntries: EventEntry[];
  onClickNew: (hour: number) => void;
  onClickUpdate: (eventEntry: EventEntry) => void;
}

/**
 * EventTableLane は、タイムテーブルの予定と実績の列を表示する
 *
 */
export const EventTableLane = ({
  eventEntries,
  onClickNew,
  onClickUpdate,
}: EventTableLaneProps): JSX.Element => {
  return (
    <>
      <TimeTableContainer>
        {Array.from({ length: 24 }).map((_, hour, self) => (
          <TimeCell
            key={hour}
            isBottom={hour === self.length - 1}
            onClick={(): void => {
              onClickNew(hour + startHourLocal);
            }}
          />
        ))}
        {eventEntries.map((event) => (
          <EventSlot
            key={event.id}
            variant="contained"
            startTime={event.start}
            endTime={event.end}
            onClick={(): void => onClickUpdate(event)}
          >
            <EventSlotText>{event.summary}</EventSlotText>
          </EventSlot>
        ))}
      </TimeTableContainer>
    </>
  );
};

interface ActivityTableLaneProps {
  activityTooltipEvents: ActivityTooltipEvent[];
}

/**
 * ActivityTableLane は、タイムテーブルのアクティビティの列を表示する
 *
 */
export const ActivityTableLane = ({
  activityTooltipEvents,
}: ActivityTableLaneProps): JSX.Element => {
  return (
    <TimeTableContainer>
      {Array.from({ length: 24 }).map((_, i, self) => (
        <TimeCell key={i} isBottom={i === self.length - 1} isRight={true} />
      ))}
      {activityTooltipEvents.map((activity, index) => (
        <Tooltip
          key={activity.event.id}
          title={<ActivityDetailsStepper activeStep={activity.activeStep} steps={activity.steps} />}
          placement="left"
        >
          <ActivitySlot
            startTime={activity.event.start}
            endTime={activity.event.end}
            colorIndex={index}
          ></ActivitySlot>
        </Tooltip>
      ))}
    </TimeTableContainer>
  );
};
