import { injectable } from 'inversify';
import { IOverlapEventMergeService } from './IOverlapEventMergeService';
import { EventEntry } from '@shared/data/EventEntry';
import { EventEntryFactory } from './EventEntryFactory';
import { format } from 'date-fns';

interface Interval {
  start: Date;
  end: Date;
}

/**
 * 連続した同じイベントを1つにまとめるサービス
 *
 * 以下のイベントはマージ対象外としている
 * - 削除されたイベント
 * - 1日全体のイベント
 * - 外部と同期をとっているイベント
 */
@injectable()
export class OverlapEventMergeServiceImpl implements IOverlapEventMergeService {
  mergeOverlapEvent(events: EventEntry[]): EventEntry[] {
    const mergedEvents: EventEntry[] = [];
    let eventsToMerge = [...events];

    // マージ対象外のイベントを結果に格納する
    const excludedEvents = eventsToMerge.filter(
      (event) =>
        event.deleted != null ||
        event.externalEventEntryId != null ||
        event.start.dateTime == null ||
        event.end.dateTime == null
    );
    mergedEvents.push(...excludedEvents);
    for (const event of excludedEvents) {
      console.log(
        `${event.summary}：${format(event.start.dateTime ?? 0, 'HH:mm')}~${format(
          event.end.dateTime ?? 0,
          'HH:mm'
        )}`
      );
    }
    const excludedEventIds = excludedEvents.map((event) => event.id);
    eventsToMerge = events.filter((event) => !excludedEventIds.includes(event.id));

    while (eventsToMerge.length > 0) {
      // 残っているイベントを1つ取得して、それと全く同じイベントを全て取得する
      const event = eventsToMerge[0];
      const targetEvents = eventsToMerge.filter((e) => this.isSameEvent(event, e));

      // 取得したイベントをマージし、結果に格納する
      const mergedIntervals = this.mergeOverlapIntervals(
        targetEvents.map((event: EventEntry): Interval => {
          if (event.start.dateTime == null || event.end.dateTime == null) {
            throw Error();
          }
          return { start: event.start.dateTime, end: event.end.dateTime };
        })
      );
      mergedEvents.push(
        ...mergedIntervals.map(({ start: start, end: end }) =>
          EventEntryFactory.create({
            ...event,
            start: { date: null, dateTime: start },
            end: { date: null, dateTime: end },
          })
        )
      );

      // 残っているイベントのリストから、処理したイベントを削除する
      const processedEventIds = targetEvents.map((event) => event.id);
      eventsToMerge = eventsToMerge.filter((event) => !processedEventIds.includes(event.id));
    }

    return mergedEvents;
  }

  /**
   * 同じイベントかどうかを判定する関数
   *
   * @param event1
   * @param event2
   * @returns
   */
  private isSameEvent(event1: EventEntry, event2: EventEntry): boolean {
    const arrayEqual = (array1?: string[] | null, array2?: string[] | null): boolean => {
      // null, undefined, 空の配列は全て同一として扱う
      if (!array1) {
        return !array2;
      }
      if (!array2) {
        return false;
      }
      return array1.length === array2.length && array1.every((t) => array2.includes(t));
    };
    return (
      event1.userId === event2.userId &&
      event1.eventType === event2.eventType &&
      event1.summary === event2.summary &&
      event1.description === event2.description &&
      event1.location === event2.location &&
      event1.externalEventEntryId === event2.externalEventEntryId &&
      event1.projectId === event2.projectId &&
      event1.categoryId === event2.categoryId &&
      arrayEqual(event1.labelIds, event2.labelIds) &&
      event1.taskId === event2.taskId
    );
  }

  /**
   * 時間帯の配列に対して、重複のある部分を結合する処理を施した時間帯の配列を返す
   *
   * intervalsを開始時間の昇順でソートし、開始時間の早い順にマージされたintervalを生成する。
   * 開始時間が同じintervalが処理し終わるタイミングでは、終了時間はその中で最も遅い時間になる。
   * 開始時間が切り替わるタイミングで、開始時間がマージ中のintervalより遅い場合、
   * そこで空白の時間ができるため、現在のマージを完了して次のマージに移る。
   *
   * @param intervals
   * @returns
   */
  private mergeOverlapIntervals(intervals: Interval[]): Interval[] {
    const sortedIntervals = [...intervals].sort((i1, i2) => {
      return i1.start.getTime() - i2.start.getTime();
    });

    let currentInterval: Interval | null = null;
    const mergedIntervals: Interval[] = [];
    for (const interval of sortedIntervals) {
      currentInterval ??= interval;
      if (interval.start.getTime() > currentInterval.end.getTime()) {
        mergedIntervals.push(currentInterval);
        currentInterval = interval;
        continue;
      }
      if (currentInterval.end.getTime() < interval.end.getTime()) {
        currentInterval.end = interval.end;
      }
    }
    if (currentInterval !== null) {
      // 一番最後にマージしたIntervalは結果に格納されていないため、格納する
      mergedIntervals.push(currentInterval);
    }
    return mergedIntervals;
  }
}
