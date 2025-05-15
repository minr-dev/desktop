import { ParentRefContext, TIME_CELL_HEIGHT, TimeCell } from './common';
import { Box } from '@mui/material';
import { useRef } from 'react';
import React from 'react';
import { EditableEventTimeCell } from '@renderer/services/EventTimeCell';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { DragDropResizeState, DraggableSlot } from './DraggableSlot';

interface TimeLaneProps<TEvent> {
  name: string;
  backgroundColor: string;
  isRight?: boolean;
  overlappedEvents: EditableEventTimeCell<TEvent>[];
  slotText: (event: EditableEventTimeCell<TEvent>) => JSX.Element;
  onAddEventEntry: (hour: number) => void;
  onUpdateEventEntry: (eventEntry: TEvent) => void;
  onDragStop: (state: DragDropResizeState<TEvent>) => void;
  onResizeStop: (state: DragDropResizeState<TEvent>) => void;
}

/**
 * EventTableLane は、タイムラインの予定と実績の列を表示する
 *
 */
export const TimeLane = <TEvent,>({
  name,
  backgroundColor,
  isRight = false,
  overlappedEvents,
  slotText,
  onAddEventEntry,
  onUpdateEventEntry,
  onDragStop,
  onResizeStop,
}: TimeLaneProps<TEvent>): JSX.Element => {
  const { userPreference } = useUserPreference();
  const startHourLocal = userPreference?.startHourLocal;

  return (
    <TimeLaneContainer name={name}>
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
      {startHourLocal != null &&
        Array.from({ length: 24 }).map((_, hour, self) => (
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
  children: React.ReactNode;
}

export const TimeLaneContainer = ({ name, children }: TimeLaneContainerProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
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
