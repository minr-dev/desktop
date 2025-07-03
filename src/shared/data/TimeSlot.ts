import { Time } from './Time';

/**
 * TODO: ジェネリクスの定義の修正
 * この定義だと、`start`が`Date`、`end`が`Time`みたいなデータを作れてしまう
 */
export interface TimeSlot<T extends Date | Time> {
  start: T;
  end: T;
}
