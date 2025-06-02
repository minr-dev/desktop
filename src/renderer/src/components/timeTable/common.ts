import { styled } from '@mui/system';
import { Box } from '@mui/material';
import { addDays, differenceInMinutes, startOfDay } from 'date-fns';

export const HEADER_CELL_HEIGHT = 2;

export const TIME_CELL_HEIGHT = 3;

const Cell = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isBottom' && prop !== 'isRight',
})<{ isBottom?: boolean; isRight?: boolean }>(({ theme, isBottom: isBottom, isRight }) => ({
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  textAlign: 'center',
  border: '1px solid',
  borderBottom: isBottom ? '1px solid' : 'none',
  borderRight: isRight ? '1px solid' : 'none',
  borderColor: theme.palette.divider,
}));

export const TimeCell = styled(Cell)(({ isBottom }) => ({
  height: isBottom ? `${TIME_CELL_HEIGHT}rem` : `calc(${TIME_CELL_HEIGHT}rem - 1px)`,
  paddingLeft: 0,
  paddingRight: 0,
}));

export const HeaderCell = styled(Cell)(({ theme }) => ({
  height: `${HEADER_CELL_HEIGHT}rem`,
  paddingTop: theme.spacing(1),
}));

/**
 * 指定された日時における1日の開始日時を取得します。
 *
 * startHourLocal が 6:00 のとき、 date に 2/15 10:00 を指定すると 2/15 6:00 を返す。
 * startHourLocal が 6:00 のとき、 date に 2/15 5:00 を指定すると 2/14 6:00 を返す。
 *
 * @param date
 * @returns
 */

export const getStartDate = (date: Date, startHourLocal: number): Date => {
  let startDate = new Date(date);
  // 1日の開始時刻に設定する
  startDate.setHours(startHourLocal % 24, 0, 0, 0);
  if (date < startDate) {
    // 現在時刻が1日の開始時刻より前の場合、日付を1日前にする
    startDate = addDays(startDate, -1);
  }
  return startDate;
};

/**
 * 指定の時間をテーブルのオフセット値（時間単位）に変換します。
 *
 * startHourLocal からの経過時間を計算し、その値を時間単位で返す。
 *
 * タイムラインの表示位置を計算することが目的なので、date は Date型ではあるが、
 * 時間情報のみを使う。
 *
 * startHourLocal が 6:00 で date が 12:00 の場合は 6 を返す。
 * startHourLocal が 6:00 で date が 4:00 の場合は 22 を返す。
 *
 * @param date - オフセットを計算するための日時
 * @param startHourLocal - 1日の開始時間
 * @returns 時間単位でのオフセット
 */
export const convertDateToTableOffset = (date: Date, startHourLocal: number): number => {
  // 開始時間を日付の一部として考慮するために、日付の開始時間を取得します。
  const startDate = startOfDay(date);

  // 現在の日付と開始時間との差を計算します。
  const diffMinutes = differenceInMinutes(date, startDate);

  // 開始時間を0とするために開始時間（分）を引きます。
  const minutesFromStart = diffMinutes - startHourLocal * 60;

  // 分を時間単位に変換します。 startHourLocal が 0時 以外の場合は、
  // マイナスになるので、その場合は 24 に足す。
  let offset = minutesFromStart / 60;
  if (offset < 0) {
    offset = 24 + offset;
  }
  return offset;
};
