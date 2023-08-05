import { styled } from '@mui/system';
import { Box } from '@mui/material';
import { differenceInMinutes, startOfDay } from 'date-fns';

// TODO 設定画面で設定できるようにする
export const startHourLocal = 6;

export const HEADER_CELL_HEIGHT = 2;

export const TIME_CELL_HEIGHT = 3;

const Cell = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isBottom' && prop !== 'isRight',
})<{ isBottom?: boolean; isRight?: boolean }>(({ theme, isBottom: isBottom, isRight }) => ({
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  textAlign: 'center',
  border: '1px solid grey',
  borderBottom: isBottom ? '1px solid grey' : 'none',
  borderRight: isRight ? '1px solid grey' : 'none',
}));

export const TimeCell = styled(Cell)(({ isBottom }) => ({
  height: isBottom ? `${TIME_CELL_HEIGHT}rem` : `calc(${TIME_CELL_HEIGHT}rem - 1px)`,
}));

export const HeaderCell = styled(Cell)(({ theme }) => ({
  height: `${HEADER_CELL_HEIGHT}rem`,
  paddingTop: theme.spacing(1),
}));

export const TimeTableContainer = styled(Box)({
  position: 'relative',
  height: `${TIME_CELL_HEIGHT * 24}rem`, // adjust this according to your needs
});

export const convertDateToTableOffset = (date: Date): number => {
  // 開始時間を日付の一部として考慮するために、日付の開始時間を取得します。
  const startDate = startOfDay(date);

  // 現在の日付と開始時間との差を計算します。
  const diffMinutes = differenceInMinutes(date, startDate);

  // 開始時間を0とするために開始時間（分）を引きます。
  const minutesFromStart = diffMinutes - startHourLocal * 60;

  // 分を1時間=1remに変換します。
  let offset = minutesFromStart / 60;
  if (offset < 0) {
    offset = 24 + offset;
  }
  return offset;
};
