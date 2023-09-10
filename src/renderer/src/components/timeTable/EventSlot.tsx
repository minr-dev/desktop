import { Box, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { ParentRefContext, TIME_CELL_HEIGHT, convertDateToTableOffset } from './common';
import { Rnd } from 'react-rnd';
import { useContext, useEffect, useState } from 'react';
import { addMinutes, differenceInMinutes } from 'date-fns';
import { EventEntryTimeCell } from '@renderer/services/EventTimeCell';

export interface DragDropResizeState {
  eventTimeCell: EventEntryTimeCell;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

interface EventSlotProps {
  bounds: string;
  eventTimeCell: EventEntryTimeCell;
  onClick?: () => void;
  onDragStop: (state: DragDropResizeState) => void;
  onResizeStop: (state: DragDropResizeState) => void;
  color?: string;
  backgroundColor?: string;
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
  eventTimeCell,
  onClick,
  onDragStop,
  onResizeStop,
  children,
  color,
  backgroundColor,
}: EventSlotProps): JSX.Element => {
  const parentRef = useContext(ParentRefContext);
  const theme = useTheme();
  // 1時間の枠の高さ
  const cellHeightPx = (theme.typography.fontSize + 2) * TIME_CELL_HEIGHT;
  // TODO EventDateTime の対応
  const start = eventTimeCell.cellFrameStart;
  const end = eventTimeCell.cellFrameEnd;
  // レーンの中の表示開始位置（時間）
  const startHourOffset = convertDateToTableOffset(start);
  let durationHours = (end.getTime() - start.getTime()) / 3600000;
  if (startHourOffset + durationHours > 24) {
    durationHours = 24 - startHourOffset;
  }
  // イベントの高さ
  const slotHeightPx = durationHours * cellHeightPx;
  const startOffsetPx = startHourOffset * cellHeightPx;
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [dragDropResizeState, setDragDropResizeState] = useState<DragDropResizeState>({
    eventTimeCell: eventTimeCell,
    offsetX: 0,
    offsetY: startOffsetPx,
    // この 0 はダミーで、実際の値は、parentRef が有効になったときの useEffect で計算される
    width: 0,
    height: slotHeightPx,
  });
  const [isDragging, setIsDragging] = useState(false);
  // 親Elementの幅から本Elementの幅（具体的なPixel数）を再計算する
  // イベントの同時間帯の枠が重なっている場合の幅を分割計算も、ここで行う
  // CSS の calc() で幅を自動計算できることを期待したが Rnd の size に、
  // calc() による設定は出来なかったので、親Elementのpixel数から計算することにした。
  // ResizeObserverを使うのは、画面のサイズが変わったときにも再計算させるため。
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (parentRef?.current) {
        let newWidth = parentRef.current.offsetWidth;
        let newOffsetX = 0;
        if (eventTimeCell.overlappingCount > 1) {
          newWidth = newWidth / eventTimeCell.overlappingCount;
          newOffsetX = newWidth * eventTimeCell.overlappingIndex;
        }
        if (dragDropResizeState.width !== newWidth) {
          const newState = { ...dragDropResizeState };
          newState.width = newWidth;
          newState.offsetX = newOffsetX;
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
  }, [parentRef, dragDropResizeState, eventTimeCell]);

  useEffect(() => {
    const newStartOffsetPx = convertDateToTableOffset(eventTimeCell.cellFrameStart) * cellHeightPx;

    setDragDropResizeState((prevState) => {
      const newState = { ...prevState };
      newState.offsetY = newStartOffsetPx;

      const newElapsed =
        (eventTimeCell.cellFrameEnd.getTime() - eventTimeCell.cellFrameStart.getTime()) / 3600000;
      newState.height = newElapsed * cellHeightPx;

      return newState;
    });
  }, [cellHeightPx, eventTimeCell]);

  const handleClick = (): void => {
    console.log('onClick isDragging', isDragging);
    if (!isDragging && onClick) {
      onClick();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragStart = (_e, d): void => {
    setIsDragging(true);
    const { x, y } = d;
    setDragStartPosition({ x, y });
    console.log('onDragStart', isDragging, x, y, dragStartPosition);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragStop = (_e, d): void => {
    setTimeout(() => {
      setIsDragging(false);
      setTimeout(() => {
        console.log('onDragStop1: ', isDragging);
      }, 100);
    }, DRAG_CLICK_THRESHOLD_MS);
    const { x, y } = d;
    if (x === dragStartPosition.x && y === dragStartPosition.y) {
      setIsDragging(false);
      setTimeout(() => {
        console.log('onDragStop2 cancel', isDragging);
      }, 100);
      return;
    }
    const newDDRState = { ...dragDropResizeState };
    const dragY = y - dragStartPosition.y;
    newDDRState.offsetY = dragDropResizeState.offsetY + dragY;

    const min = (dragY / cellHeightPx) * 60;
    // TODO EventDateTime の対応
    const durationMin = differenceInMinutes(
      newDDRState.eventTimeCell.endTime,
      newDDRState.eventTimeCell.startTime
    );

    const newStartTime = addMinutes(newDDRState.eventTimeCell.cellFrameStart, min);
    const newEndTime = addMinutes(newStartTime, durationMin);
    newDDRState.eventTimeCell = newDDRState.eventTimeCell.replaceTime(newStartTime, newEndTime);

    newDDRState.offsetY =
      convertDateToTableOffset(newDDRState.eventTimeCell.cellFrameStart) * cellHeightPx;
    setDragDropResizeState(newDDRState);
    onDragStop(newDDRState);
    setDragStartPosition({ x: newDDRState.offsetX, y: newDDRState.offsetY });
    setTimeout(() => {
      setIsDragging(false);
      setTimeout(() => {
        console.log('onDragStop3', isDragging);
      }, 100);
    }, DRAG_CLICK_THRESHOLD_MS);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleResizeStop = (_e, _dir, ref, _delta, _position): void => {
    const newState = { ...dragDropResizeState };
    newState.eventTimeCell = newState.eventTimeCell.copy();
    const min = (ref.offsetHeight / cellHeightPx) * 60;
    const roundMin = Math.round(min / DRAG_GRID_MIN) * DRAG_GRID_MIN;
    // TODO EventDateTime の対応
    const newEndTime = addMinutes(newState.eventTimeCell.cellFrameStart, roundMin);
    newState.eventTimeCell = newState.eventTimeCell.replaceEndTime(newEndTime);
    const diffMin = differenceInMinutes(
      newState.eventTimeCell.cellFrameEnd,
      newState.eventTimeCell.cellFrameStart
    );
    newState.height = (diffMin / 60) * cellHeightPx;
    setDragDropResizeState(newState);
    onResizeStop(newState);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleResize = (_e, _dir, ref, _delta, position): void => {
    const newState = {
      eventTimeCell: dragDropResizeState.eventTimeCell,
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      offsetX: position.x,
      offsetY: position.y,
    };
    setDragDropResizeState(newState);
  };

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
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onResize={handleResize}
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        overflow="hidden"
        onClick={handleClick}
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
