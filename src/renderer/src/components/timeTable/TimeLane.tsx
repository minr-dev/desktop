import { TIME_CELL_HEIGHT, TimeCell } from './common';
import { Box } from '@mui/material';
import { useRef } from 'react';
import React from 'react';
import { EditableEventTimeCell } from '@renderer/services/EventTimeCell';
import { TimeLaneContext } from './TimeLaneContext';
import { DraggableSlot } from './DraggableSlot';

interface TimeLaneProps<
  TEvent,
  TEventTimeCell extends EditableEventTimeCell<TEvent, TEventTimeCell>
> {
  name: string;
  backgroundColor: string;
  isRight?: boolean;
  startTime?: Date | null;
  overlappedEvents: TEventTimeCell[];
  slotText: (event: TEventTimeCell) => JSX.Element;
  onAddEvent: (hour: number) => void;
  onUpdateEvent: (eventEntry: TEvent) => void;
  onDragStop: (event: TEventTimeCell) => void;
  onResizeStop: (event: TEventTimeCell) => void;
}

/**
 * EventTableLane は、タイムラインの予定と実績の列を表示する
 *
 */
export const TimeLane = <
  TEvent,
  TEventTimeCell extends EditableEventTimeCell<TEvent, TEventTimeCell>
>({
  name,
  backgroundColor,
  isRight = false,
  startTime,
  overlappedEvents,
  slotText,
  onAddEvent: onAddEventEntry,
  onUpdateEvent: onUpdateEventEntry,
  onDragStop,
  onResizeStop,
}: TimeLaneProps<TEvent, TEventTimeCell>): JSX.Element => {
  if (startTime == null) {
    return <>Loading...</>;
  }

  const startHourLocal = startTime.getHours();
  return (
    <TimeLaneContainer name={name} startTime={startTime}>
      {overlappedEvents.map((oe) => (
        <DraggableSlot
          key={oe.id}
          bounds={`.${name}`}
          eventTimeCell={oe}
          backgroundColor={backgroundColor}
          onClick={(): void => onUpdateEventEntry(oe.event)}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
        >
          {slotText(oe)}
        </DraggableSlot>
      ))}
      {Array.from({ length: 24 }).map((_, hour, self) => (
        <TimeCell
          key={hour + startHourLocal}
          isBottom={hour === self.length - 1}
          onClick={(): void => {
            onAddEventEntry(hour + startHourLocal);
          }}
          isRight={isRight}
        />
      ))}
    </TimeLaneContainer>
  );
};

interface TimeLaneContainerProps {
  name: string;
  startTime?: Date | null;
  children: React.ReactNode;
}

export const TimeLaneContainer = ({
  name,
  startTime,
  children,
}: TimeLaneContainerProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cellCount = 24;
  return (
    <Box
      className={name}
      ref={containerRef}
      sx={{
        position: 'relative',
        height: `${TIME_CELL_HEIGHT * cellCount}rem`,
      }}
    >
      <TimeLaneContext.Provider
        value={{ startTime, cellMinutes: 60, cellCount, parentRef: containerRef }}
      >
        {children}
      </TimeLaneContext.Provider>
    </Box>
  );
};
