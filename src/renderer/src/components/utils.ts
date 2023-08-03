import { addDays, differenceInMinutes, startOfDay } from 'date-fns';

// TODO 設定画面で設定できるようにする
export const startHourLocal = 6;

export const TITLE_HEIGHT = 2;

export const HOUR_HEIGHT = 3;

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
