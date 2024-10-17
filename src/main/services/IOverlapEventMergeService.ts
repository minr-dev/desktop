import { EventEntry } from '@shared/data/EventEntry';

export interface IOverlapEventMergeService {
  /**
   * イベントの配列に対して、日時が連続した同じイベントを結合した配列を返す
   *
   * @param events
   * @param isSameEvent
   */
  mergeOverlapEvent(events: EventEntry[]): EventEntry[];
}
