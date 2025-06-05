import { TIME_CELL_HEIGHT, TimeCell } from './common';
import { Box } from '@mui/material';
import { useContext, useRef } from 'react';
import React from 'react';
import { EditableEventTimeCell } from '@renderer/services/EventTimeCell';
import { ParentRefContext } from './common';
import { DragDropResizeState, DraggableSlot } from './DraggableSlot';
import { TimelineContext } from './TimelineContext';

interface TimeLaneProps<
  TEvent,
  TEventTimeCell extends EditableEventTimeCell<TEvent, TEventTimeCell>
> {
  name: string;
  backgroundColor: string;
  isRight?: boolean;
  /** デフォルトではTimeLaneに対応する範囲だが、それ以外で指定したい場合に使う */
  bounds?: string;
  overlappedEvents: TEventTimeCell[];
  /** 複製中のセル。オリジナルがドラッグされ、これは元々の位置に表示される */
  copiedEvent: TEventTimeCell | null;
  slotText: (event: TEventTimeCell) => JSX.Element;
  onAddEvent: (hour: number) => void;
  onUpdateEvent: (eventEntry: TEvent) => void;
  onDragStart?: (event: TEventTimeCell, state: DragDropResizeState) => void;
  onDragStop: (event: TEventTimeCell, state: DragDropResizeState) => void;
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
  bounds,
  overlappedEvents,
  copiedEvent,
  slotText,
  onAddEvent,
  onUpdateEvent,
  onDragStart,
  onDragStop,
  onResizeStop,
}: TimeLaneProps<TEvent, TEventTimeCell>): JSX.Element => {
  const { startTime } = useContext(TimelineContext);
  if (startTime == null) {
    return <>Loading...</>;
  }

  const startHourLocal = startTime.getHours();
  return (
    <TimeLaneContainer name={name}>
      {overlappedEvents.map((oe) => (
        <DraggableSlot
          key={oe.id}
          bounds={bounds ?? `.${name}`}
          eventTimeCell={oe}
          backgroundColor={backgroundColor}
          onClick={(): void => onUpdateEvent(oe.event)}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
        >
          {slotText(oe)}
        </DraggableSlot>
      ))}
      {copiedEvent && (
        <DraggableSlot
          key={'copied'}
          bounds={`.${name}`}
          eventTimeCell={copiedEvent}
          backgroundColor={backgroundColor}
          onDragStop={onDragStop}
          onResizeStop={onResizeStop}
        >
          {slotText(copiedEvent)}
        </DraggableSlot>
      )}
      {Array.from({ length: 24 }).map((_, hour, self) => (
        <TimeCell
          key={hour + startHourLocal}
          isBottom={hour === self.length - 1}
          onClick={(): void => {
            onAddEvent(hour + startHourLocal);
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
  const { intervalCount: cellCount } = useContext(TimelineContext);
  return (
    <Box
      className={name}
      ref={containerRef}
      sx={{
        position: 'relative',
        height: `${TIME_CELL_HEIGHT * cellCount}rem`,
      }}
    >
      <ParentRefContext.Provider value={containerRef}>{children}</ParentRefContext.Provider>
    </Box>
  );
};
