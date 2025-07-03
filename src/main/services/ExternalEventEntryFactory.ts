import { EventEntry } from '@shared/data/EventEntry';
import { ExternalEventEntry } from '@shared/data/ExternalEventEntry';

export class ExternalEventEntryFactory {
  static create(overlaps: Partial<ExternalEventEntry>): ExternalEventEntry {
    if (!overlaps.id) {
      throw new Error('id is required');
    }
    if (!overlaps.id.calendarId) {
      throw new Error('id.calendarId is required');
    }
    if (!overlaps.id.systemId) {
      throw new Error('id.systemId is required');
    }
    if (!overlaps.id.id) {
      throw new Error('id.id is required');
    }
    if (!overlaps.summary) {
      throw new Error('summary is required');
    }
    if (!overlaps.start) {
      throw new Error('start is required');
    }
    if (!overlaps.end) {
      throw new Error('end is required');
    }
    return {
      id: overlaps.id,
      summary: overlaps.summary,
      start: overlaps.start,
      end: overlaps.end,
      ...overlaps,
    };
  }

  /**
   * minrのイベントから外部イベントを作成する
   *
   * 外部イベントのIDは、登録してからじゃないとわからないので、
   * APIで登録したあと、APIで再取得して、minrイベントを更新するので、
   * この時点では、 id.id と id.systemId はセットしない。
   *
   * @param minr minrのイベント
   * @param calendarId カレンダーID
   * @returns 外部イベント
   */
  static createFromMinr(minr: EventEntry, calendarId: string): ExternalEventEntry {
    return {
      id: {
        calendarId: calendarId,
      },
      summary: minr.summary,
      start: minr.start,
      end: minr.end,
      description: minr.description,
      location: minr.location,
    };
  }

  static updateFromMinr(external: ExternalEventEntry, minr: EventEntry): void {
    external.summary = minr.summary;
    external.start = minr.start;
    external.end = minr.end;
    external.description = minr.description;
    external.location = minr.location;
  }
}
