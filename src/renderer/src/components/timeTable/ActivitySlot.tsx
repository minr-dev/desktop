import { Box } from '@mui/material';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { ActivityEvent } from '@shared/dto/ActivityEvent';
import { TIME_CELL_HEIGHT, convertDateToTableOffset } from './common';

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
 *     colorIndex={index}
 *   ></ActivitySlot>
 * </Tooltip>
 * ```
 *
 * 枠にマウスを持っていくと Tooltip でアクティビティの明細が見えるようにする。
 * 尚、Tooltip の中身は、ActivityDetailsStepper で構成する。
 */
export const ActivitySlot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'startTime' && prop !== 'endTime' && prop !== 'colorIndex',
})<{ startTime: Date; endTime: Date; colorIndex: number }>(({ startTime, endTime, colorIndex }) => {
  // dateオブジェクトをrem単位に変換します。
  const hourOffset = convertDateToTableOffset(startTime);
  let hours = (endTime.getTime() - startTime.getTime()) / 3600000;
  if (hourOffset + hours > 24) {
    hours = 24 - hourOffset;
  }
  const hoursHeight = hours * TIME_CELL_HEIGHT;
  const rems = hourOffset * TIME_CELL_HEIGHT;

  const theme = useTheme();
  const color = colorIndex % 2 === 0 ? theme.palette.info.light : theme.palette.success.dark;

  return {
    position: 'absolute',
    top: `calc(${rems}rem + 1px)`,
    height: `${hoursHeight}rem`,
    width: '1rem',
    overflow: 'hidden',
    backgroundColor: color,
    margin: 0,
    padding: 0,
    fontSize: '0.75rem',
    // borderRadius: '5px',
  };
});

export interface ActivityTooltipEvent {
  event: ActivityEvent;
  steps: ActivityEvent[];
  activeStep: number;
}
