import { addDays, set } from 'date-fns';

export interface Time {
  hours: number;
  minutes: number;
}

export const dateToTime = (date: Date): Time => {
  return { hours: date.getHours(), minutes: date.getMinutes() };
};

/**
 * `targetDateTime`の時刻以降で初めて`time`の時刻になる`Date`オブジェクトを返す。
 */
export const timeToDate = (time: Time, targetDateTime: Date): Date => {
  const date = set(targetDateTime, { ...time, seconds: 0, milliseconds: 0 });
  if (date < targetDateTime) {
    return addDays(date, 1);
  }
  return date;
};

/**
 * `Date`型前提の実装に対して、`Time`型を対応させるために利用する。
 * 本当は`Time`型にも対応できるように実装を直したい。
 *
 * @param startHour 開始時刻の起点。この時刻の`Time`オブジェクトが一番早くなる。
 */
export const timeToDummyDate = (time: Time, startHour?: number): Date =>
  timeToDate(time, set(0, { hours: startHour }));

/** 正の値を返す剰余 */
const mod = (a: number, b: number): number => {
  return a * b >= 0 ? a % b : (a % b) + b;
};

/** 時間を0:00~24:00の間に正規化する */
const normilizeTime = (time: Time): Time => {
  const totalMinutes = mod(time.hours * 60 + time.minutes, 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = mod(totalMinutes, 60);
  return { hours, minutes };
};

export const isValid = (time: Time): boolean => {
  return !isNaN(time.hours) && !isNaN(time.minutes);
};

export const addHours = (time: Time, amount: number): Time => {
  return normilizeTime({ hours: time.hours + amount, minutes: time.minutes });
};

export const addMinutes = (time: Time, amount: number): Time => {
  return normilizeTime({ hours: time.hours, minutes: time.minutes + amount });
};

export const differenceInMinutes = (timeLeft: Time, timeRight: Time): number => {
  return timeLeft.hours * 60 + timeLeft.minutes - timeRight.hours * 60 - timeRight.minutes;
};
