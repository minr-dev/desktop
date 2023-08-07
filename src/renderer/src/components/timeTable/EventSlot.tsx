import { Button, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { ParentRefContext, TIME_CELL_HEIGHT, convertDateToTableOffset } from './common';
import { EventEntry } from '@shared/dto/EventEntry';
import { DraggableData, Rnd, RndDragEvent } from 'react-rnd';
import { useContext, useEffect, useState } from 'react';
import { addMinutes, differenceInMinutes } from 'date-fns';

export type BUTTON_VARIANT = 'text' | 'outlined' | 'contained';
export type BUTTON_COLOR =
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

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
  variant?: BUTTON_VARIANT;
  color?: BUTTON_COLOR;
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
 * 構成は、 EventSlotContainer が、 内部の Button のテキストを制御するためのラッパーで
 * 枠の高さは、 EventSlotContainer の div で指定している。
 * ただし、実際には、内部に配置している Button の高さに依存してしまうので、
 * Button の方でも、 height の指定をしている。
 * 尚、Button の height は、この div height を inherit すると伝わるので、
 * 高さの指定は、EventSlotContainer にのみ行うことで対応される。
 *
 * Buttonのテキストでスケジュールのタイトルを表示しているが、枠内に収まらない場合は、
 * 3点リーダーで省略させるために、Button 内で EventSlotText を使用するようにしている。
 * これをしないと、textOverflow: 'ellipsis' が効かなかった。
 */
export const EventSlot = ({
  bounds,
  eventEntry,
  onClick,
  onDragStop,
  onResizeStop,
  children,
  variant,
  color,
}: EventSlotProps): JSX.Element => {
  const parentRef = useContext(ParentRefContext);
  const theme = useTheme();
  const cellHeightPx = (theme.typography.fontSize + 2) * TIME_CELL_HEIGHT;
  const startOffset = convertDateToTableOffset(eventEntry.start);
  let elapsed = (eventEntry.end.getTime() - eventEntry.start.getTime()) / 3600000;
  if (startOffset + elapsed > 24) {
    elapsed = 24 - startOffset;
  }
  const slotHeightPx = elapsed * cellHeightPx;
  const startOffsetPx = startOffset * cellHeightPx;
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragDropResizeState, setDragDropResizeState] = useState<DragDropResizeState>({
    eventEntry: eventEntry,
    offsetX: 0,
    offsetY: startOffsetPx,
    width: 100,
    height: slotHeightPx,
  });
  const [lastDragStart, setLastDragStart] = useState(0);
  const [lastDragStop, setLastDragStop] = useState(0);
  // console.log({
  //   startOffset: startOffset,
  //   elapsed: elapsed,
  //   slotHeightPx: slotHeightPx,
  //   startOffsetPx: startOffsetPx,
  //   fontSize: theme.typography.fontSize,
  // });
  useEffect(() => {
    if (parentRef && parentRef.current) {
      // ここでparentRef.currentを使って何らかの操作を行う。
      // console.log("Parent's DOM element:", parentRef.current);
      if (dragDropResizeState.width !== parentRef.current.offsetWidth) {
        const newState = { ...dragDropResizeState };
        newState.width = parentRef.current.offsetWidth;
        setDragDropResizeState(newState);
      }
      // 例：親要素の背景色を変更する
      // parentRef.current.style.backgroundColor = 'lightblue';
    }
  }, [parentRef, dragDropResizeState]);

  // const grid = (TIME_CELL_HEIGHT * theme.typography.fontSize + 1) / 4;

  const style = {
    // display: 'flex',
    // alignItems: 'center',
    // justifyContent: 'center',
    // border: 'solid 1px #ddd',
    // background: '#f0f0f0',
  } as const;

  return (
    <Rnd
      style={style}
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
      dragGrid={[1, 48 / 4]}
      resizeGrid={[1, 48 / 4]}
      size={{
        width: dragDropResizeState.width,
        height: dragDropResizeState.height,
      }}
      position={{
        x: dragDropResizeState.offsetX,
        y: dragDropResizeState.offsetY,
      }}
      onDragStart={(e: RndDragEvent, d: DraggableData): void => {
        const { x, y } = d;
        setDragPosition({ x, y });
        setLastDragStart(Date.now());
        console.log('onDragStart', x, y, dragPosition);
      }}
      onDrag={(e: RndDragEvent, d: DraggableData): void => {
        console.log('onDrag');
      }}
      onDragStop={(e: RndDragEvent, d: DraggableData): void => {
        const { x, y } = d;
        if (x === dragPosition.x && y === dragPosition.y) {
          console.log('onDragStop cancel');
          return;
        }
        const newState = { ...dragDropResizeState };
        const dragY = y - dragPosition.y;
        newState.offsetY = dragDropResizeState.offsetY + dragY;

        const min = (dragY / cellHeightPx) * 60;
        const diffMin = differenceInMinutes(newState.eventEntry.end, newState.eventEntry.start);
        newState.eventEntry = { ...newState.eventEntry };
        newState.eventEntry.start = addMinutes(newState.eventEntry.start, min);
        const roundMin =
          Math.round(newState.eventEntry.start.getMinutes() / DRAG_GRID_MIN) * DRAG_GRID_MIN;
        newState.eventEntry.start.setMinutes(roundMin);
        newState.eventEntry.end = addMinutes(newState.eventEntry.start, diffMin);
        newState.offsetY = convertDateToTableOffset(newState.eventEntry.start) * cellHeightPx;
        setDragDropResizeState(newState);
        onDragStop(newState);
        setDragPosition({ x: newState.offsetX, y: newState.offsetY });

        setLastDragStop(Date.now());
      }}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onResizeStop={(_e, _dir, ref, _delta, _position): void => {
        const newState = { ...dragDropResizeState };
        newState.eventEntry = { ...newState.eventEntry };
        const min = (ref.offsetHeight / cellHeightPx) * 60;
        const roundMin = Math.round(min / DRAG_GRID_MIN) * DRAG_GRID_MIN;
        newState.eventEntry.end = addMinutes(newState.eventEntry.start, roundMin);
        const diffMin = differenceInMinutes(newState.eventEntry.end, newState.eventEntry.start);
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
      <Button
        fullWidth
        onClick={(e: React.MouseEvent): void => {
          console.log('Button onClick', {
            screenX: e.screenX,
            screenY: e.screenY,
            clientX: e.clientX,
            clientY: e.clientY,
            movementX: e.movementX,
            movementY: e.movementY,
            mousePosition: dragPosition,
          });
          if (onClick) {
            const now = Date.now();
            const timeSinceLastDragStart = now - lastDragStart;
            const timeSinceLastDragStop = now - lastDragStop;
            if (
              timeSinceLastDragStop > DRAG_CLICK_THRESHOLD_MS ||
              (lastDragStart < lastDragStop && timeSinceLastDragStart < DRAG_CLICK_THRESHOLD_MS)
            ) {
              onClick();
            }
          }
        }}
        variant={variant}
        color={color}
        sx={{ height: dragDropResizeState.height }}
      >
        {children}
      </Button>
    </Rnd>
  );
};

export const EventSlotText = styled('div')({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textAlign: 'left',
});
