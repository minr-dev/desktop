import { injectable } from 'inversify';
import { IOverlapEventMergeService } from './IOverlapEventMergeService';
import { EventEntry } from '@shared/data/EventEntry';
import { EventEntryFactory } from './EventEntryFactory';

interface Interval {
  start: Date;
  end: Date;
}

type EventClassifierProperties = Pick<
  EventEntry,
  | 'userId'
  | 'eventType'
  | 'summary'
  | 'location'
  | 'description'
  | 'projectId'
  | 'categoryId'
  | 'taskId'
  | 'labelIds'
  | 'isProvisional'
>;

/**
 * 連続した同じイベントを1つにまとめるサービス
 *
 * 以下のイベントはマージ対象外として、何もせずに返すようにしている
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
    const excludedEventIds = excludedEvents.map((event) => event.id);
    eventsToMerge = events.filter((event) => !excludedEventIds.includes(event.id));

    while (eventsToMerge.length > 0) {
      // 残っているイベントを1つ取得して、それと同じイベントを全て取得する
      const classifierProperties = this.extractEventClassifierProperties(eventsToMerge[0]);
      const targetEvents = eventsToMerge.filter((event) =>
        this.matchEventClassifier(event, classifierProperties)
      );

      // 取得したイベントをマージし、結果に格納する
      const mergedIntervals = this.mergeOverlapIntervals(
        targetEvents.map((event: EventEntry): Interval => {
          if (event.start.dateTime == null || event.end.dateTime == null) {
            throw new Error();
          }
          return { start: event.start.dateTime, end: event.end.dateTime };
        })
      );
      mergedEvents.push(
        ...mergedIntervals.map(({ start: start, end: end }) => {
          return EventEntryFactory.create({
            ...classifierProperties,
            start: { dateTime: start },
            end: { dateTime: end },
          });
        })
      );

      // 残っているイベントのリストから、処理したイベントを削除する
      const processedEventIds = targetEvents.map((event) => event.id);
      eventsToMerge = eventsToMerge.filter((event) => !processedEventIds.includes(event.id));
    }

    return mergedEvents;
  }

  /**
   * 同じイベントかを判断するために比較するプロパティを抽出する
   * null、undefined、空の配列は区別しないため、nullに統一する
   * @param event
   * @returns
   */
  private extractEventClassifierProperties(event: EventEntry): EventClassifierProperties {
    return {
      userId: event.userId,
      eventType: event.eventType,
      summary: event.summary,
      location: event.location || null,
      description: event.description || null,
      projectId: event.projectId || null,
      categoryId: event.categoryId || null,
      taskId: event.taskId || null,
      labelIds: event.labelIds || null,
      isProvisional: event.isProvisional,
    };
  }

  private matchEventClassifier(
    event: EventEntry,
    classifierProperties: EventClassifierProperties
  ): boolean {
    return (
      JSON.stringify(this.extractEventClassifierProperties(event)) ===
      JSON.stringify(classifierProperties)
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
