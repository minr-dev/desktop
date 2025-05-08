import rendererContainer from '../../inversify.config';
import { Box, useTheme } from '@mui/material';
import { useState } from 'react';
import { Rnd } from 'react-rnd';
import { convertDateToTableOffset, HEADER_CELL_HEIGHT, TIME_CELL_HEIGHT } from './common';
import { EventEntryTimeCell } from '@renderer/services/EventTimeCell';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { getOptimalTextColor } from '@renderer/utils/ColotUtil';
import { EventSlotText } from './EventSlotText';
import { IEventEntryProxy } from '@renderer/services/IEventEntryProxy';
import { TYPES } from '@renderer/types';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { addMinutes } from 'date-fns';

interface EventEntryDuplicationBordProps {
  overlappedPlanEvents: EventEntryTimeCell[] | null;
  overlappedActualEvents: EventEntryTimeCell[] | null;
  handleSaveEventEntry: (eventEntry: EventEntry) => Promise<void>;
}

/**
 * 複製するイベントのセルデータ
 */
interface EventDuplicateCellProps {
  /** 複製元のイベントセル */
  eventEntryTimeCell: EventEntryTimeCell;
  /** セルのX座標 */
  offsetX: number;
  /** セルのY座標 */
  offsetY: number;
  /** セルの幅 */
  width: number;
  /** セルの高さ */
  height: number;
  /** セルの背景色 */
  background: string;
}

// ドラッグしたときに 15分刻みの位置にスナップする
const DRAG_GRID_MIN = 15;

export const EventEntryDuplicationBord = ({
  overlappedPlanEvents,
  overlappedActualEvents,
  handleSaveEventEntry,
}: EventEntryDuplicationBordProps): JSX.Element => {
  const [eventDuplicateCell, setEventDuplicateCell] = useState<EventDuplicateCellProps | null>(
    null
  );
  const { userPreference } = useUserPreference();
  const theme = useTheme();
  const headerHeightPx = (theme.typography.fontSize + 6) * HEADER_CELL_HEIGHT;
  const cellHeightPx = (theme.typography.fontSize + 2) * TIME_CELL_HEIGHT;
  const startHourLocal = userPreference?.startHourLocal;

  // ボックスを追加しドラッグするという挙動が難しいため、クリックでコピーと貼り付けを行う。
  const handleMouseDown = async (event: React.MouseEvent<HTMLDivElement>): Promise<void> => {
    if (startHourLocal == null) {
      return;
    }
    // 現在の要素の寸法を取得
    const current = event.currentTarget.getBoundingClientRect();
    // Gridに合わせて画面を12分割したピクセルを取得する
    const widthPx = (current.width - 16) / 12;
    // タイムライン内のマウス座標
    const mouseDownPositionX = event.clientX - current.left;
    const mouseDownPositionY = event.clientY - current.top;

    if (eventDuplicateCell && mouseDownPositionY > headerHeightPx) {
      // 複製を行う際に不必要になったセルを削除する。
      setEventDuplicateCell(null);
      const originEventOffsetY =
        convertDateToTableOffset(eventDuplicateCell.eventEntryTimeCell.startTime, startHourLocal) *
          cellHeightPx +
        headerHeightPx;
      // 複製するイベントから何分時間が離れているかを計算する。
      const min = ((mouseDownPositionY - originEventOffsetY) / cellHeightPx) * 60;
      const roundMin = Math.round(min / DRAG_GRID_MIN) * DRAG_GRID_MIN;
      const start = addMinutes(eventDuplicateCell.eventEntryTimeCell.startTime, roundMin);
      const end = addMinutes(eventDuplicateCell.eventEntryTimeCell.endTime, roundMin);
      // マウスのX座標が予定、実績のどちらに入っているかを判定する。
      const eventType = mouseDownPositionX < widthPx * 5 ? EVENT_TYPE.PLAN : EVENT_TYPE.ACTUAL;
      const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
      const createEvent = await eventEntryProxy.create(
        eventDuplicateCell.eventEntryTimeCell.event.userId,
        eventType,
        eventDuplicateCell.eventEntryTimeCell.event.summary,
        { dateTime: start },
        { dateTime: end }
      );
      const duplicateEvent = await eventEntryProxy.save({
        ...createEvent,
        description: eventDuplicateCell.eventEntryTimeCell.event.description,
        projectId: eventDuplicateCell.eventEntryTimeCell.event.projectId,
        categoryId: eventDuplicateCell.eventEntryTimeCell.event.categoryId,
        taskId: eventDuplicateCell.eventEntryTimeCell.event.taskId,
        labelIds: eventDuplicateCell.eventEntryTimeCell.event.labelIds,
        notificationSetting: eventDuplicateCell.eventEntryTimeCell.event.notificationSetting,
        isProvisional: eventDuplicateCell.eventEntryTimeCell.event.isProvisional,
      });
      await handleSaveEventEntry(duplicateEvent);
    } else {
      const addEventDuplicateCell = (events: EventEntryTimeCell[]): void => {
        for (const event of events) {
          const cellCollision = {
            top:
              headerHeightPx +
              convertDateToTableOffset(event.startTime, startHourLocal) * cellHeightPx,
            bottom:
              headerHeightPx +
              convertDateToTableOffset(event.endTime, startHourLocal) * cellHeightPx,
            width: widthPx * 4,
            height:
              (convertDateToTableOffset(event.endTime, startHourLocal) -
                convertDateToTableOffset(event.startTime, startHourLocal)) *
              cellHeightPx,
          };
          if (mouseDownPositionY > cellCollision.top && mouseDownPositionY < cellCollision.bottom) {
            setEventDuplicateCell({
              eventEntryTimeCell: event,
              offsetX: mouseDownPositionX,
              offsetY: mouseDownPositionY,
              width: cellCollision.width,
              height: cellCollision.height,
              background: theme.palette.secondary.main,
            });
            break;
          }
        }
      };
      addEventDuplicateCell(overlappedPlanEvents || []);
      addEventDuplicateCell(overlappedActualEvents || []);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (!eventDuplicateCell) return;
    const current = event.currentTarget.getBoundingClientRect();
    const widthPx = (current.width - 16) / 12;
    const mousePositionX = event.clientX - current.left;
    const mousePositionY = event.clientY - current.top;
    if (mousePositionX < widthPx * 5) {
      setEventDuplicateCell({
        ...eventDuplicateCell,
        offsetX: mousePositionX,
        offsetY: mousePositionY,
        background: theme.palette.primary.main,
      });
    } else {
      setEventDuplicateCell({
        ...eventDuplicateCell,
        offsetX: mousePositionX,
        offsetY: mousePositionY,
        background: theme.palette.secondary.main,
      });
    }
  };

  const textColor = getOptimalTextColor(theme.palette.primary.main);
  const borderColor = theme.palette.mode === 'dark' ? 'black' : 'white';

  return (
    <Box
      sx={{ height: `${HEADER_CELL_HEIGHT + TIME_CELL_HEIGHT * 24}rem`, position: 'relative' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      {eventDuplicateCell && (
        <Rnd
          position={{ x: eventDuplicateCell.offsetX, y: eventDuplicateCell.offsetY }}
          size={{ width: eventDuplicateCell.width, height: eventDuplicateCell.height }}
          style={{
            display: 'flex',
            border: '1px solid',
            borderColor: borderColor,
            borderRadius: 0.5,
            color: textColor,
            background: eventDuplicateCell.background,
            opacity: 0.9,
            paddingLeft: '0.25rem',
            fontSize: '12px',
            alignItems: 'top',
            justifyContent: 'left',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
          enableResizing={false}
        >
          <EventSlotText eventTimeCell={eventDuplicateCell.eventEntryTimeCell} />
        </Rnd>
      )}
    </Box>
  );
};
