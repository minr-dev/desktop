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
import { ParentRefContext, TIME_CELL_HEIGHT, convertDateToTableOffset } from './common';
import {
  ActivityEventTimeCell,
  EventTimeCell,
  GitHubEventTimeCell,
} from '@renderer/services/EventTimeCell';
import { useContext, useEffect, useState } from 'react';
import { CheckCircle } from '@mui/icons-material';
import { getOptimalTextColor } from '@renderer/utils/ColotUtil';

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
  const [slotRect, setSlotRect] = useState<SlotRect>({
    x: 0,
    y: startHourOffset * cellHeightPx,
    width: 0,
    height: durationHours * cellHeightPx,
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
      const width = (parentWidth - 2) / eventTimeCell.overlappingCount;
      const x = width * eventTimeCell.overlappingIndex;
      const y = convertDateToTableOffset(eventTimeCell.cellFrameStart) * cellHeightPx;
      const newDurationHours =
        (eventTimeCell.cellFrameEnd.getTime() - eventTimeCell.cellFrameStart.getTime()) / 3600000;
      const height = newDurationHours * cellHeightPx;
      const newRect = {
        ...prevRect,
        x: x,
        y: y,
        width: width,
        height: height,
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
  }, [parentRef, eventTimeCell, slotRect, cellHeightPx]);

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
          <Typography variant="body2">
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
