import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { ActivityEvent } from '@shared/data/ActivityEvent';
import {
  ParentRefContext,
  SelectedDateContext,
  TIME_CELL_HEIGHT,
  convertDateToTableOffset,
} from './common';
import {
  ActivityEventTimeCell,
  EventTimeCell,
  GitHubEventTimeCell,
} from '@renderer/services/EventTimeCell';
import { useContext, useEffect, useState } from 'react';
import { CheckCircle } from '@mui/icons-material';
import { getOptimalTextColor } from '@renderer/utils/ColotUtil';
import { useUserPreference } from '@renderer/hooks/useUserPreference';
import { addDays } from 'date-fns';

interface SlotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ActivitySlotProps {
  eventTimeCell: EventTimeCell;
  children?: React.ReactNode;
}

/**
 * ActivitySlot はアクティビティの枠を表示する
 *
 * ```
 * <Tooltip
 *   title={<ActivityDetailsStepper activeStep={event.activeStep} steps={event.steps} />}
 *   placement="left"
 * >
 *   <ActivitySlot
 *     startTime={event.start}
 *     endTime={event.end}
 *     appColor={event.appColor}
 *   ></ActivitySlot>
 * </Tooltip>
 * ```
 *
 * 枠にマウスを持っていくと Tooltip でアクティビティの明細が見えるようにする。
 * 尚、Tooltip の中身は、ActivityDetailsStepper で構成する。
 */
export const ActivitySlot = ({ eventTimeCell, children }: ActivitySlotProps): JSX.Element => {
  const { userPreference } = useUserPreference();
  const parentRef = useContext(ParentRefContext);
  const theme = useTheme();
  const targetDate = useContext(SelectedDateContext);
  // 1時間の枠の高さ
  const cellHeightPx = (theme.typography.fontSize + 2) * TIME_CELL_HEIGHT;
  const startHourLocal = userPreference?.startHourLocal;
  const [slotRect, setSlotRect] = useState<SlotRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  // 親Elementの幅から本Elementの幅（具体的なPixel数）を再計算する
  // イベントの同時間帯の枠が重なっている場合の幅を分割計算も、ここで行う
  // CSS の calc() で幅を自動計算できることを期待したが Rnd の size に、
  // calc() による設定は出来なかったので、親Elementのpixel数から計算することにした。
  // ResizeObserverを使うのは、画面のサイズが変わったときにも再計算させるため。
  useEffect(() => {
    const recalcSlotRect = (
      parentWidth: number,
      eventTimeCell: EventTimeCell,
      prevRect: SlotRect
    ): void => {
      if (!targetDate || startHourLocal == null) {
        return;
      }
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
      const y = startHourOffset * cellHeightPx;

      const slotWidthPx = (parentWidth - 2) / eventTimeCell.overlappingCount;
      const x = slotWidthPx * eventTimeCell.overlappingIndex;

      const newRect = {
        ...prevRect,
        x: x,
        y: y,
        width: slotWidthPx,
        height: slotHeightPx,
      };
      if (JSON.stringify(newRect) !== JSON.stringify(prevRect)) {
        setSlotRect(newRect);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (parentRef?.current) {
        recalcSlotRect(parentRef.current.offsetWidth, eventTimeCell, slotRect);
      }
    });

    if (parentRef?.current) {
      recalcSlotRect(parentRef.current.offsetWidth, eventTimeCell, slotRect);

      resizeObserver.observe(parentRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
    return () => {};
  }, [parentRef, eventTimeCell, slotRect, cellHeightPx, targetDate, startHourLocal]);

  const backgroundColor = eventTimeCell.backgroundColor;
  const color = backgroundColor
    ? getOptimalTextColor(backgroundColor)
    : theme.palette.primary.contrastText;
  const borderColor = theme.palette.mode === 'dark' ? 'black' : 'white';

  let desc: React.ReactElement;
  // TODO eventTimeCell を汎化しているのに、ここで instanceof で分岐するのは、あまりよくない
  // 使い勝手を確認するために、実装優先で安易な実装にしているが、どこかで修正したい
  if (eventTimeCell instanceof ActivityEventTimeCell) {
    desc = (
      <Card>
        <CardContent>
          <Typography variant="h5" component="div">
            {eventTimeCell.summary}
          </Typography>
          <Typography variant="body2" component="div">
            <List dense={true}>
              {eventTimeCell.event.details.map((d) => (
                <ListItem key={d.id}>
                  <ListItemIcon>
                    <CheckCircle />
                  </ListItemIcon>
                  <ListItemText primary={d.windowTitle} />
                </ListItem>
              ))}
            </List>
          </Typography>
        </CardContent>
      </Card>
    );
  } else if (eventTimeCell instanceof GitHubEventTimeCell) {
    desc = (
      <Card>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            GitHubイベント
          </Typography>
          <Typography variant="h5" component="div">
            {eventTimeCell.summary}
          </Typography>
          <Typography variant="body2">{eventTimeCell.description}</Typography>
        </CardContent>
      </Card>
    );
  } else {
    return <></>;
  }

  return (
    <Tooltip key={eventTimeCell.id} title={desc}>
      <Box
        position="absolute"
        display="flex"
        justifyContent="center"
        alignItems="center"
        overflow="hidden"
        color={color}
        left={slotRect.x}
        top={slotRect.y}
        sx={{
          width: slotRect.width,
          borderRadius: 0.5,
          border: '1px solid',
          borderColor: borderColor,
          height: slotRect.height,
          fontSize: '12px',
          backgroundColor: backgroundColor,
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
};

export interface ActivityTooltipEvent {
  event: ActivityEvent;
  steps: ActivityEvent[];
  activeStep: number;
}
