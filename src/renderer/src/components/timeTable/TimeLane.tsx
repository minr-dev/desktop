import { EventEntry } from '@shared/data/EventEntry';
import { DragDropResizeState, EventSlot } from './EventSlot';
import { ParentRefContext, TIME_CELL_HEIGHT, TimeCell, startHourLocal } from './common';
import { Box } from '@mui/material';
import { useRef } from 'react';
import React from 'react';
import { EventEntryTimeCell } from '@renderer/services/EventTimeCell';
import { EventSlotText } from './EventSlotText';

interface TimeLaneProps {
  name: string;
  backgroundColor: string;
  overlappedEvents: EventEntryTimeCell[];
  onAddEventEntry: (hour: number) => void;
  onUpdateEventEntry: (eventEntry: EventEntry) => void;
  onDragStop: (state: DragDropResizeState) => void;
  onResizeStop: (state: DragDropResizeState) => void;
}

/**
 * EventTableLane は、タイムラインの予定と実績の列を表示する
 *
 */
export const TimeLane = ({
  name,
  backgroundColor,
  overlappedEvents,
  onAddEventEntry,
  onUpdateEventEntry,
  onDragStop,
  onResizeStop,
}: TimeLaneProps): JSX.Element => {
  return (
    <TimeLaneContainer name={name}>
      {overlappedEvents.map((oe) => (
        <EventSlot
          key={oe.id}
          bounds={`.${name}`}
          eventTimeCell={oe}
          backgroundColor={backgroundColor}
          onClick={(): void => onUpdateEventEntry(oe.event)}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
        >
          <EventSlotText eventTimeCell={oe} />
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
    </TimeLaneContainer>
  );
};

interface TimeLaneContainerProps {
  name: string;
  children: React.ReactNode;
}

export const TimeLaneContainer = ({ name, children }: TimeLaneContainerProps): JSX.Element => {
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
