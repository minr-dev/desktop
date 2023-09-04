import { Box, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { ParentRefContext, TIME_CELL_HEIGHT, convertDateToTableOffset } from './common';
import { EventEntry } from '@shared/dto/EventEntry';
import { Rnd } from 'react-rnd';
import { useContext, useEffect, useState } from 'react';
import { addMinutes, differenceInMinutes } from 'date-fns';
import { eventDateTimeToDate } from '@shared/dto/EventDateTime';

export interface DragDropResizeState {
  eventEntry: EventEntry;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

interface EventSlotProps {
  bounds: string;
  eventEntry: EventEntry;
  onClick?: () => void;
  onDragStop: (state: DragDropResizeState) => void;
  onResizeStop: (state: DragDropResizeState) => void;
  color?: string;
  backgroundColor?: string;
  overlappingIndex: number;
  overlappingCount: number;
  children?: React.ReactNode;
}

// ドラッグの直後に click イベントが発火してしまうので、
// この閾値の間は、click イベントを無視する
const DRAG_CLICK_THRESHOLD_MS = 500;

// ドラッグしたときに 15分刻みの位置にスナップする
const DRAG_GRID_MIN = 15;

/**
 * EventSlot は予定・実績の枠を表示する
 *
 * ```
 * <EventSlot
 *   variant="contained"
 *   startTime={start}
 *   endTime={end}
 *   onClick={handleOpen}
 * >
 *   <EventSlotText>{title}</EventSlotText>
 * </EventSlot>
 * ```
 *
 * 構成は、 EventSlotContainer が、 内部の Box のテキストを制御するためのラッパーで
 * 枠の高さは、 EventSlotContainer の div で指定している。
 * ただし、実際には、内部に配置している Box の高さに依存してしまうので、
 * Box の方でも、 height の指定をしている。
 * 尚、Box の height は、この div height を inherit すると伝わるので、
 * 高さの指定は、EventSlotContainer にのみ行うことで対応される。
 *
 * イベントのタイトルが枠内に収まらない場合は、3点リーダーで省略させるために、
 * EventSlotText を使用するようにしている。
 * これをしないと、textOverflow: 'ellipsis' が効かなかった。
 */
export const EventSlot = ({
  bounds,
  eventEntry: initialEventEntry,
  onClick,
  onDragStop,
  onResizeStop,
  children,
  color,
  backgroundColor,
  overlappingIndex,
  overlappingCount,
}: EventSlotProps): JSX.Element => {
  const parentRef = useContext(ParentRefContext);
  const theme = useTheme();
  const [eventEntry, setEventEntry] = useState(initialEventEntry);
  // 1時間の枠の高さ
  const cellHeightPx = (theme.typography.fontSize + 2) * TIME_CELL_HEIGHT;
  // TODO EventDateTime の対応
  const start = eventDateTimeToDate(eventEntry.start);
  const end = eventDateTimeToDate(eventEntry.end);
  // レーンの中の表示開始位置（時間）
  const startHourOffset = convertDateToTableOffset(start);
  let elapsedHours = (end.getTime() - start.getTime()) / 3600000;
  if (startHourOffset + elapsedHours > 24) {
    elapsedHours = 24 - startHourOffset;
  }
  // イベントの高さ
  const slotHeightPx = elapsedHours * cellHeightPx;
  const startOffsetPx = startHourOffset * cellHeightPx;
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragDropResizeState, setDragDropResizeState] = useState<DragDropResizeState>({
    eventEntry: eventEntry,
    offsetX: 0,
    offsetY: startOffsetPx,
    width: 100,
    height: slotHeightPx,
  });
  // console.log({
  //   cellHeightPx: cellHeightPx,
  //   startOffset: startHourOffset,
  //   elapsedHours: elapsedHours,
  //   startOffsetPx: startOffsetPx,
  //   slotHeightPx: slotHeightPx,
  //   dragDropResizeState: dragDropResizeState,
  // });
  const [isDragging, setIsDragging] = useState(false);
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (parentRef?.current) {
        const newWidth = parentRef.current.offsetWidth;
        if (dragDropResizeState.width !== newWidth) {
          const newState = { ...dragDropResizeState };
          newState.width = newWidth;
          if (overlappingCount > 1) {
            newState.width = newWidth / overlappingCount;
            newState.offsetX = newState.width * overlappingIndex;
          }
          if (JSON.stringify(dragDropResizeState) !== JSON.stringify(newState)) {
            setDragDropResizeState(newState);
          }
        }
      }
    });

    if (parentRef?.current) {
      resizeObserver.observe(parentRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
    return () => {};
  }, [parentRef, dragDropResizeState, overlappingCount, overlappingIndex]);
  useEffect(() => {
    setEventEntry(initialEventEntry);

    const newStartOffsetPx =
      convertDateToTableOffset(eventDateTimeToDate(initialEventEntry.start)) * cellHeightPx;

    setDragDropResizeState((prevState) => {
      const newState = { ...prevState };
      newState.offsetY = newStartOffsetPx;

      const newElapsed =
        (eventDateTimeToDate(initialEventEntry.end).getTime() -
          eventDateTimeToDate(initialEventEntry.start).getTime()) /
        3600000;
      const newSlotHeightPx = newElapsed * cellHeightPx;
      newState.height = newSlotHeightPx;

      return newState;
    });
  }, [initialEventEntry, cellHeightPx]);

  return (
    <Rnd
      bounds={bounds}
      // scale={0.5}
      // default={{
      //   width: '50%',
      //   height: slotHeightPx,
      //   x: 0,
      //   y: startOffsetPx,
      // }}
      // resizeGrid={[0, 1]}
      enableResizing={{
        bottom: true,
        bottomLeft: false,
        bottomRight: false,
        left: false,
        right: false,
        top: false,
        topLeft: false,
        topRight: false,
      }}
      // dragAxis="y"
      dragGrid={[1, cellHeightPx / 4]}
      resizeGrid={[1, cellHeightPx / 4]}
      size={{
        width: dragDropResizeState.width,
        height: dragDropResizeState.height,
      }}
      position={{
        x: dragDropResizeState.offsetX,
        y: dragDropResizeState.offsetY,
      }}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onDragStart={(_e, d): void => {
        setIsDragging(true);
        const { x, y } = d;
        setDragPosition({ x, y });
        console.log('onDragStart', isDragging, x, y, dragPosition);
      }}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onDrag={(_e, _d): void => {
        console.log('onDrag');
      }}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onDragStop={(_e, d): void => {
        setTimeout(() => {
          setIsDragging(false);
          setTimeout(() => {
            console.log('onDragStop1: ', isDragging);
          }, 100);
        }, DRAG_CLICK_THRESHOLD_MS);
        const { x, y } = d;
        if (x === dragPosition.x && y === dragPosition.y) {
          setIsDragging(false);
          setTimeout(() => {
            console.log('onDragStop2 cancel', isDragging);
          }, 100);
          return;
        }
        const newState = { ...dragDropResizeState };
        const dragY = y - dragPosition.y;
        newState.offsetY = dragDropResizeState.offsetY + dragY;

        const min = (dragY / cellHeightPx) * 60;
        // TODO EventDateTime の対応
        const diffMin = differenceInMinutes(
          eventDateTimeToDate(newState.eventEntry.end),
          eventDateTimeToDate(newState.eventEntry.start)
        );
        newState.eventEntry = { ...newState.eventEntry };
        newState.eventEntry.start.dateTime = addMinutes(
          eventDateTimeToDate(newState.eventEntry.start),
          min
        );
        const roundMin =
          Math.round(eventDateTimeToDate(newState.eventEntry.start).getMinutes() / DRAG_GRID_MIN) *
          DRAG_GRID_MIN;
        newState.eventEntry.start.dateTime.setMinutes(roundMin);
        newState.eventEntry.end.dateTime = addMinutes(
          eventDateTimeToDate(newState.eventEntry.start),
          diffMin
        );
        newState.offsetY =
          convertDateToTableOffset(eventDateTimeToDate(newState.eventEntry.start)) * cellHeightPx;
        setDragDropResizeState(newState);
        onDragStop(newState);
        setDragPosition({ x: newState.offsetX, y: newState.offsetY });
        setTimeout(() => {
          setIsDragging(false);
          setTimeout(() => {
            console.log('onDragStop3', isDragging);
          }, 100);
        }, DRAG_CLICK_THRESHOLD_MS);
      }}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onResizeStop={(_e, _dir, ref, _delta, _position): void => {
        const newState = { ...dragDropResizeState };
        newState.eventEntry = { ...newState.eventEntry };
        const min = (ref.offsetHeight / cellHeightPx) * 60;
        const roundMin = Math.round(min / DRAG_GRID_MIN) * DRAG_GRID_MIN;
        // TODO EventDateTime の対応
        newState.eventEntry.end.dateTime = addMinutes(
          eventDateTimeToDate(newState.eventEntry.start),
          roundMin
        );
        const diffMin = differenceInMinutes(
          eventDateTimeToDate(newState.eventEntry.end),
          eventDateTimeToDate(newState.eventEntry.start)
        );
        newState.height = (diffMin / 60) * cellHeightPx;
        setDragDropResizeState(newState);
        onResizeStop(newState);
      }}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onResize={(_e, _dir, ref, _delta, position): void => {
        const newState = {
          eventEntry: dragDropResizeState.eventEntry,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          offsetX: position.x,
          offsetY: position.y,
        };
        setDragDropResizeState(newState);
      }}
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        overflow="hidden"
        onClick={(): void => {
          console.log('onClick isDragging', isDragging);
          if (!isDragging && onClick) {
            onClick();
          }
        }}
        color={color}
        sx={{
          width: 'calc(100% - 1px)',
          borderRadius: 0.5,
          border: '1px solid #fff',
          height: dragDropResizeState.height,
          fontSize: '12px',
          backgroundColor: backgroundColor,
          '&:hover': {
            // backgroundColor: color === 'primary' ? 'primary.main' : 'transparent',
            opacity: [0.9, 0.8, 0.7],
          },
        }}
      >
        {children}
      </Box>
    </Rnd>
  );
};

export const EventSlotText = styled('div')({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textAlign: 'left',
});
