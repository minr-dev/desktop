import { useTheme } from '@mui/material';
import { TIME_CELL_HEIGHT } from './common';
import { Rnd } from 'react-rnd';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { addMinutes, differenceInMinutes, max, min } from 'date-fns';
import {
  EditableEventTimeCell,
  EventEntryTimeCell,
  PlanTemplateEventTimeCell,
} from '@renderer/services/EventTimeCell';
import { getOptimalTextColor } from '@renderer/utils/ColotUtil';
import { getLogger } from '@renderer/utils/LoggerUtil';
import { EventEntry } from '@shared/data/EventEntry';
import { PlanTemplateEvent } from '@shared/data/PlanTemplateEvent';
import { TimeLaneContext } from './TimeLaneContext';

export interface DragDropResizeState {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

interface DraggableSlotProps<
  TEvent,
  TEventTimeCell extends EditableEventTimeCell<TEvent, TEventTimeCell>
> {
  bounds: string;
  eventTimeCell: TEventTimeCell;
  onClick?: () => void;
  onDragStop: (eventTimeCell: TEventTimeCell) => void;
  onResizeStop: (eventTimeCell: TEventTimeCell) => void;
  backgroundColor?: string;
  children?: React.ReactNode;
}

// ドラッグの直後に click イベントが発火してしまうので、
// この閾値の間は、click イベントを無視する
const DRAG_CLICK_THRESHOLD_MS = 500;

// ドラッグしたときに 15分刻みの位置にスナップする
const DRAG_GRID_MIN = 15;

const logger = getLogger('EventSlot');

/**
 * DraggableSlot は予定・実績の枠を表示するのに使用する
 *
 * ```
 * <DraggableSlot
 *   variant="contained"
 *   startTime={start}
 *   endTime={end}
 *   onClick={handleOpen}
 * >
 *   <EventSlotText>{title}</EventSlotText>
 * </DraggableSlot>
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
export const DraggableSlot = <
  TEvent,
  TEventTimeCell extends EditableEventTimeCell<TEvent, TEventTimeCell>
>({
  bounds,
  eventTimeCell,
  onClick,
  onDragStop,
  onResizeStop,
  children,
  backgroundColor,
}: DraggableSlotProps<TEvent, TEventTimeCell>): JSX.Element => {
  if (logger.isDebugEnabled()) logger.debug('EventSlot called with:', eventTimeCell.summary);

  const { startTime: laneStart, cellMinutes, cellCount, parentRef } = useContext(TimeLaneContext);
  // 再計算の度に`Date`の参照が変わって他の`useEffect`などを誘発するのでメモ化する
  const laneEnd = useMemo(
    () => (laneStart ? addMinutes(laneStart, cellMinutes * cellCount) : null),
    [cellCount, cellMinutes, laneStart]
  );

  const theme = useTheme();
  // 1時間の枠の高さ
  const cellHeightPx = (theme.typography.fontSize + 2) * TIME_CELL_HEIGHT;
  // 1分あたりの高さ
  const HeightPxPerMinute = cellHeightPx / cellMinutes;
  const [localEventTimeCell, setLocalEventTimeCell] = useState<TEventTimeCell>(eventTimeCell);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [dragDropResizeState, setDragDropResizeState] = useState<DragDropResizeState>({
    // この 0 はダミーで、実際の値は、parentRef が有効になったときの useEffect で計算される
    offsetX: 0,
    offsetY: 0,
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setLocalEventTimeCell(eventTimeCell);
  }, [eventTimeCell]);

  // x軸方向の再計算
  // 親Elementの幅から本Elementの幅（具体的なPixel数）を再計算する
  // イベントの同時間帯の枠が重なっている場合の幅を分割計算も、ここで行う
  // CSS の calc() で幅を自動計算できることを期待したが Rnd の size に、
  // calc() による設定は出来なかったので、親Elementのpixel数から計算することにした。
  // ResizeObserverを使うのは、画面のサイズが変わったときにも再計算させるため。
  const recalcDDRWidth = useCallback(
    (parentWidth: number): void => {
      const slotWidthPx =
        (parentWidth - theme.typography.fontSize) / localEventTimeCell.overlappingCount;
      const offsetX = slotWidthPx * localEventTimeCell.overlappingIndex;
      setDragDropResizeState((prevState) => ({ ...prevState, offsetX, width: slotWidthPx }));
    },
    [
      localEventTimeCell.overlappingCount,
      localEventTimeCell.overlappingIndex,
      theme.typography.fontSize,
    ]
  );
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (parentRef?.current) {
        recalcDDRWidth(parentRef.current.clientWidth);
      }
    });

    if (parentRef?.current) {
      recalcDDRWidth(parentRef.current.clientWidth);
      resizeObserver.observe(parentRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
    return () => {};
  }, [parentRef, recalcDDRWidth]);

  // y軸方向の再計算
  const recalcDDRHeights = useCallback(
    (cellFrameStart: Date, cellFrameEnd: Date) => {
      if (!laneStart || !laneEnd) {
        return;
      }
      const start = max([cellFrameStart, laneStart]);
      const end = min([cellFrameEnd, laneEnd]);

      // レーンの中の表示開始位置（分）
      const startMinutesOffset = differenceInMinutes(start, laneStart);
      const durationMinutes = differenceInMinutes(end, start);
      const startOffsetPx = startMinutesOffset * HeightPxPerMinute;
      // イベントの高さ
      const slotHeightPx = durationMinutes * HeightPxPerMinute;
      setDragDropResizeState((prevState) => ({
        ...prevState,
        offsetY: startOffsetPx,
        height: slotHeightPx,
      }));
    },
    [HeightPxPerMinute, laneEnd, laneStart]
  );
  useEffect(() => {
    recalcDDRHeights(localEventTimeCell.cellFrameStart, localEventTimeCell.cellFrameEnd);
  }, [localEventTimeCell.cellFrameEnd, localEventTimeCell.cellFrameStart, recalcDDRHeights]);

  const handleClick = (): void => {
    if (logger.isDebugEnabled()) logger.debug('onClick isDragging', isDragging);
    if (!isDragging && onClick) {
      onClick();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragStart = (_e, d): void => {
    setIsDragging(true);
    const { x, y } = d;
    setDragStartPosition({ x, y });
    if (logger.isDebugEnabled()) logger.debug('onDragStart', isDragging, x, y, dragStartPosition);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragStop = (_e, d): void => {
    if (logger.isDebugEnabled()) logger.debug('handleDragStop', d);
    setTimeout(() => {
      setIsDragging(false);
      setTimeout(() => {
        if (logger.isDebugEnabled()) logger.debug('onDragStop1: ', isDragging);
      }, 100);
    }, DRAG_CLICK_THRESHOLD_MS);
    const { x, y } = d;
    if (isClickEvent(x, y, dragStartPosition)) {
      setIsDragging(false);
      setTimeout(() => {
        if (logger.isDebugEnabled()) logger.debug('onDragStop2 cancel', isDragging);
      }, 100);
      return;
    }
    const dragY = y - dragStartPosition.y;

    const prevEventTimeCell = localEventTimeCell;
    const min = dragY / HeightPxPerMinute;
    // TODO EventDateTime の対応
    const durationMin = prevEventTimeCell.getDurationMin();

    const newStartTime = addMinutes(prevEventTimeCell.cellFrameStart, min);
    const newEndTime = addMinutes(newStartTime, durationMin);
    const newEventTimeCell = prevEventTimeCell.replaceTime(newStartTime, newEndTime);

    // 画面のちらつきを抑えるため、ここで再計算する
    recalcDDRHeights(newEventTimeCell.cellFrameStart, newEventTimeCell.cellFrameEnd);
    setLocalEventTimeCell(newEventTimeCell);
    onDragStop(newEventTimeCell);
    setTimeout(() => {
      setIsDragging(false);
      setTimeout(() => {
        if (logger.isDebugEnabled()) logger.debug('onDragStop3', isDragging);
      }, 100);
    }, DRAG_CLICK_THRESHOLD_MS);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleResizeStop = (_e, _dir, ref, _delta, _position): void => {
    const prevEventTimeCell = localEventTimeCell;
    const min = (ref.offsetHeight / cellHeightPx) * 60;
    const roundMin = Math.round(min / DRAG_GRID_MIN) * DRAG_GRID_MIN;
    // TODO EventDateTime の対応
    const newEndTime = addMinutes(prevEventTimeCell.cellFrameStart, roundMin);
    const newEventTimeCell = prevEventTimeCell.replaceEndTime(newEndTime);
    // 画面のちらつきを抑えるため、ここで再計算する
    recalcDDRHeights(newEventTimeCell.cellFrameStart, newEventTimeCell.cellFrameEnd);
    setDragDropResizeState((prev) => ({ ...prev, offsetX: 0, offsetY: 0 }));
    setLocalEventTimeCell(newEventTimeCell);
    onResizeStop(newEventTimeCell);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleResize = (_e, _dir, ref, _delta, position): void => {
    const newState = {
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      offsetX: position.x,
      offsetY: position.y,
    };
    setDragDropResizeState(newState);
  };

  const textColor = getOptimalTextColor(theme.palette.primary.main);
  const borderColor = theme.palette.mode === 'dark' ? 'black' : 'white';

  return (
    <Rnd
      bounds={bounds}
      style={{
        display: 'flex',
        width: 'calc(100% - 1px)',
        height: dragDropResizeState.height,
        border: '1px solid',
        borderColor: borderColor,
        borderRadius: 0.5,
        color: textColor,
        background: backgroundColor,
        paddingLeft: '0.25rem',
        fontSize: '12px',
        alignItems: 'top',
        justifyContent: 'left',
        overflow: 'hidden',
      }}
      onClick={handleClick}
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
      {children}
    </Rnd>
  );
};

export const EventEntrySlot = (
  props: DraggableSlotProps<EventEntry, EventEntryTimeCell>
): JSX.Element => DraggableSlot<EventEntry, EventEntryTimeCell>(props);
export const TemplateEventSlot = (
  props: DraggableSlotProps<PlanTemplateEvent, PlanTemplateEventTimeCell>
): JSX.Element => DraggableSlot<PlanTemplateEvent, PlanTemplateEventTimeCell>(props);

/**
 * ドラッグ&ドロップとクリックを判定。
 * 座標が5ピクセル以内に変わらなければ、クリックと判定する。
 */
const isClickEvent = (x, y, dragStartPosition): boolean => {
  const tolerance = 5; // 5ピクセル以内の動きはクリックと見なす

  const deltaX = Math.abs(x - dragStartPosition.x);
  const deltaY = Math.abs(y - dragStartPosition.y);

  return deltaX <= tolerance && deltaY <= tolerance;
};
