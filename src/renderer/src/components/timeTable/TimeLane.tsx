import { EventEntry } from '@shared/dto/EventEntry';
import { DraggableEventSlot, EventSlot, EventSlotText } from './EventSlot';
import { TimeCell, TimeTableContainer, startHourLocal } from './common';
import { ActivitySlot, ActivityTooltipEvent } from './ActivitySlot';
import { Tooltip } from '@mui/material';
import ActivityDetailsStepper from './ActivityDetailsStepper';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSSProperties, useState } from 'react';

interface EventTableLaneProps {
  eventEntries: EventEntry[];
  onClickNew: (hour: number) => void;
  onClickUpdate: (eventEntry: EventEntry) => void;
  onDragStart: (dsEvent: DragStartEvent) => void;
  onDragEnd: (deEvent: DragEndEvent) => void;
}

/**
 * EventTableLane は、タイムテーブルの予定と実績の列を表示する
 *
 */
export const EventTableLane = ({
  eventEntries,
  onClickNew,
  onClickUpdate,
  onDragStart,
  onDragEnd,
}: EventTableLaneProps): JSX.Element => {
  const [draggingEvent, setDraggingEvent] = useState<EventEntry | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 1000,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (dsEvent: DragStartEvent): void => {
    const activeEvent = eventEntries.find((ee) => ee.id === dsEvent.active.id);
    if (activeEvent) {
      setDraggingEvent(activeEvent);
    }
    onDragStart(dsEvent);
    console.log('handleDragStart');
  };

  const handleDragEnd = (deEvent: DragEndEvent): void => {
    const { over } = deEvent;
    if (over) {
      console.log('handleDragEnd over', over.id);
    } else {
      console.log('handleDragEnd over', over);
    }
    setDraggingEvent(null);
    onDragEnd(deEvent);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <TimeTableContainer>
        {eventEntries.map((event) => (
          <DraggableEventSlot
            eventEntry={event}
            key={event.id}
            variant="contained"
            onClick={(): void => onClickUpdate(event)}
          />
        ))}
        {Array.from({ length: 24 }).map((_, hour, self) => (
          <Droppable id={`${hour}`} key={hour}>
            <TimeCell
              isBottom={hour === self.length - 1}
              onClick={(): void => {
                onClickNew(hour + startHourLocal);
              }}
            />
          </Droppable>
        ))}
        <DragOverlay>
          {draggingEvent ? (
            <EventSlot
              key={draggingEvent.id}
              variant="contained"
              startTime={draggingEvent.start}
              endTime={draggingEvent.end}
            >
              <EventSlotText>{draggingEvent.summary}</EventSlotText>
            </EventSlot>
          ) : null}
        </DragOverlay>
      </TimeTableContainer>
    </DndContext>
  );
};

interface ActivityTableLaneProps {
  activityTooltipEvents: ActivityTooltipEvent[];
}

interface DroppableProps {
  id: string;
  children: React.ReactNode;
}

const Droppable = ({ id, children }: DroppableProps): JSX.Element => {
  const { isOver, setNodeRef } = useDroppable({ id });
  let style: CSSProperties = {
    backgroundColor: 'inherit',
  };
  if (isOver) {
    style = {
      backgroundColor: 'gray',
      // border: '1px solid',
      // borderColor: '#4c9ffe',
      // height: `calc(${TIME_CELL_HEIGHT}rem - 1px)`,
    };
  }
  return (
    <div style={style} ref={setNodeRef}>
      {children}
    </div>
  );
};

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
