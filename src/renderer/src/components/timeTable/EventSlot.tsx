import { useTheme } from '@mui/material';
import {
  ParentRefContext,
  SelectedDateContext,
  TIME_CELL_HEIGHT,
  convertDateToTableOffset,
} from './common';
import { Rnd } from 'react-rnd';
import { useContext, useEffect, useState } from 'react';
import { addDays, addMinutes, differenceInMinutes } from 'date-fns';
import { EventEntryTimeCell } from '@renderer/services/EventTimeCell';
import { getOptimalTextColor } from '@renderer/utils/ColotUtil';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import rendererContainer from '../../inversify.config';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';
import { TYPES } from '@renderer/types';

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
  backgroundColor,
}: EventSlotProps): JSX.Element => {
  const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
  const logger = loggerFactory.getLogger({ processType: 'renderer', loggerName: 'EventSlot' });
  logger.info(`EventSlot called with: ${eventTimeCell.summary}`);
  const { userPreference } = useUserPreference();
  const parentRef = useContext(ParentRefContext);
  const theme = useTheme();
  const targetDate = useContext(SelectedDateContext);
  // 1時間の枠の高さ
  const cellHeightPx = (theme.typography.fontSize + 2) * TIME_CELL_HEIGHT;
  const startHourLocal = userPreference?.startHourLocal;
  // イベントの高さ
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [dragDropResizeState, setDragDropResizeState] = useState<DragDropResizeState>({
    eventTimeCell: eventTimeCell,
    // この 0 はダミーで、実際の値は、parentRef が有効になったときの useEffect で計算される
    offsetX: 0,
    offsetY: 0,
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  // 親Elementの幅から本Elementの幅（具体的なPixel数）を再計算する
  // イベントの同時間帯の枠が重なっている場合の幅を分割計算も、ここで行う
  // CSS の calc() で幅を自動計算できることを期待したが Rnd の size に、
  // calc() による設定は出来なかったので、親Elementのpixel数から計算することにした。
  // ResizeObserverを使うのは、画面のサイズが変わったときにも再計算させるため。
  useEffect(() => {
    if (!targetDate || startHourLocal == null) {
      return;
    }
    const recalcDDRState = (
      parentWidth: number,
      eventTimeCell: EventEntryTimeCell,
      prevState: DragDropResizeState
    ): void => {
      const start =
        eventTimeCell.cellFrameStart < targetDate ? targetDate : eventTimeCell.cellFrameStart;
      const end =
        eventTimeCell.cellFrameEnd < addDays(targetDate, 1)
          ? eventTimeCell.cellFrameEnd
          : addDays(targetDate, 1);
      // レーンの中の表示開始位置（時間）
      const startHourOffset = convertDateToTableOffset(start, startHourLocal);
      const durationHours = (end.getTime() - start.getTime()) / 3600000;
      // イベントの高さ
      const slotHeightPx = durationHours * cellHeightPx;
      const startOffsetPx = startHourOffset * cellHeightPx;

      const slotWidthPx =
        (parentWidth - theme.typography.fontSize) / eventTimeCell.overlappingCount;
      const offsetX = slotWidthPx * eventTimeCell.overlappingIndex;

      const newState: DragDropResizeState = {
        ...prevState,
        eventTimeCell: eventTimeCell,
        offsetX: offsetX,
        offsetY: startOffsetPx,
        width: slotWidthPx,
        height: slotHeightPx,
      };
      if (JSON.stringify(prevState) !== JSON.stringify(newState)) {
        setDragDropResizeState(newState);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (parentRef?.current) {
        recalcDDRState(parentRef.current.offsetWidth, eventTimeCell, dragDropResizeState);
      }
    });

    if (parentRef?.current) {
      recalcDDRState(parentRef.current.offsetWidth, eventTimeCell, dragDropResizeState);

      resizeObserver.observe(parentRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }

    return () => {};
  }, [
    parentRef,
    dragDropResizeState,
    eventTimeCell,
    cellHeightPx,
    theme.typography.fontSize,
    targetDate,
    startHourLocal,
  ]);

  if (!targetDate || startHourLocal == null) {
    return <></>;
  }

  const handleClick = (): void => {
    logger.info(`onClick isDragging: ${isDragging}`);
    if (!isDragging && onClick) {
      onClick();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragStart = (_e, d): void => {
    setIsDragging(true);
    const { x, y } = d;
    setDragStartPosition({ x, y });
    logger.info(
      `onDragStart: isDragging=${isDragging}, x=${x}, y=${y}, dragStartPosition=${dragStartPosition}`
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragStop = (_e, d): void => {
    logger.info(`handleDragStop: ${d}`);
    setTimeout(() => {
      setIsDragging(false);
      setTimeout(() => {
        logger.info(`onDragStop1: ${isDragging}`);
      }, 100);
    }, DRAG_CLICK_THRESHOLD_MS);
    const { x, y } = d;
    if (isClickEvent(x, y, dragStartPosition)) {
      setIsDragging(false);
      setTimeout(() => {
        logger.info(`onDragStop2 cancel: ${isDragging}`);
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
      convertDateToTableOffset(newDDRState.eventTimeCell.cellFrameStart, startHourLocal) *
      cellHeightPx;
    setDragDropResizeState(newDDRState);
    onDragStop(newDDRState);
    setDragStartPosition({ x: newDDRState.offsetX, y: newDDRState.offsetY });
    setTimeout(() => {
      setIsDragging(false);
      setTimeout(() => {
        logger.info(`onDragStop3: ${isDragging}`);
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
