import { Button } from '@mui/material';
import { styled } from '@mui/system';
import { TIME_CELL_HEIGHT, convertDateToTableOffset } from './common';

interface EventSlotProps {
  startTime: Date;
  endTime: Date;
  onClick: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
    | undefined;
  children?: React.ReactNode;
}

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
  startTime,
  endTime,
  onClick,
  children,
  variant,
  color,
}: EventSlotProps): JSX.Element => (
  <EventSlotContainer startTime={startTime} endTime={endTime}>
    <Button fullWidth onClick={onClick} variant={variant} color={color} sx={{ height: 'inherit' }}>
      {children}
    </Button>
  </EventSlotContainer>
);

const EventSlotContainer = styled('div')<{ startTime: Date; endTime: Date }>(
  ({ startTime, endTime }) => {
    const hourOffset = convertDateToTableOffset(startTime);
    let hours = (endTime.getTime() - startTime.getTime()) / 3600000;
    if (hourOffset + hours > 24) {
      hours = 24 - hourOffset;
    }
    const hoursHeight = hours * TIME_CELL_HEIGHT;

    const rems = hourOffset * TIME_CELL_HEIGHT;
    return {
      position: 'absolute',
      top: `calc(${rems}rem + 1px)`,
      height: `${hoursHeight}rem`,
      width: '90%',
      overflow: 'hidden',
    };
  }
);

export const EventSlotText = styled('div')({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textAlign: 'left',
});
