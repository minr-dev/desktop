import { EventEntry } from '@shared/dto/EventEntry';
import { DragDropResizeState, EventSlot, EventSlotText } from './EventSlot';
import { ParentRefContext, TIME_CELL_HEIGHT, TimeCell, startHourLocal } from './common';
import { ActivitySlot, ActivityTooltipEvent } from './ActivitySlot';
import { Box, Tooltip } from '@mui/material';
import ActivityDetailsStepper from './ActivityDetailsStepper';
import { useRef } from 'react';
import React from 'react';
import { EventEntryTimeCell } from '@renderer/services/EventTimeCell';

interface TimeLaneProps {
  name: string;
  color: string;
  backgroundColor: string;
  overlappedEvents: EventEntryTimeCell[];
  onAddEventEntry: (hour: number) => void;
  onUpdateEventEntry: (eventEntry: EventEntry) => void;
  onDragStop: (state: DragDropResizeState) => void;
  onResizeStop: (state: DragDropResizeState) => void;
}

/**
 * EventTableLane は、タイムテーブルの予定と実績の列を表示する
 *
 */
export const TimeLane = ({
  name,
  color,
  backgroundColor,
  overlappedEvents,
  onAddEventEntry,
  onUpdateEventEntry,
  onDragStop,
  onResizeStop,
}: TimeLaneProps): JSX.Element => {
  return (
    <TimeLeneContainer name={name}>
      {overlappedEvents.map((oe) => (
        <EventSlot
          key={oe.id}
          bounds={`.${name}`}
          eventTimeCell={oe}
          color={color}
          backgroundColor={backgroundColor}
          onClick={(): void => onUpdateEventEntry(oe.event)}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
        >
          <EventSlotText>{oe.summary}</EventSlotText>
        </EventSlot>
      ))}
      {Array.from({ length: 24 }).map((_, hour, self) => (
        <TimeCell
          key={hour + startHourLocal}
          isBottom={hour === self.length - 1}
          onClick={(): void => {
            onAddEventEntry(hour + startHourLocal);
          }}
        />
      ))}
    </TimeLeneContainer>
  );
};

interface TimeLeneContainerProps {
  name: string;
  children: React.ReactNode;
}

export const TimeLeneContainer = ({ name, children }: TimeLeneContainerProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  // if (containerRef.current) {
  //   console.log(containerRef.current.className);
  // }
  return (
    <Box
      className={name}
      ref={containerRef}
      sx={{
        position: 'relative',
        height: `${TIME_CELL_HEIGHT * 24}rem`,
      }}
    >
      <ParentRefContext.Provider value={containerRef}>{children}</ParentRefContext.Provider>
    </Box>
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
    <TimeLeneContainer name={'activity'}>
      {Array.from({ length: 24 }).map((_, i, self) => (
        <TimeCell key={i} isBottom={i === self.length - 1} isRight={true} />
      ))}
      {activityTooltipEvents.map((activity) => (
        <Tooltip
          key={activity.event.id}
          title={<ActivityDetailsStepper activeStep={activity.activeStep} steps={activity.steps} />}
          placement="left"
        >
          <ActivitySlot
            startTime={activity.event.start}
            endTime={activity.event.end}
            appColor={activity.event.appColor}
          ></ActivitySlot>
        </Tooltip>
      ))}
    </TimeLeneContainer>
  );
};
