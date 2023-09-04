import { injectable } from 'inversify';
import { IOverlapEventService, OverlappedEventEntry } from './IOverlapEventService';
import { eventDateTimeToDate } from '@shared/dto/EventDateTime';
import { EventEntry } from '@shared/dto/EventEntry';
import { format } from 'date-fns';

/**
 * イベントの重なりを計算するサービス
 *
 * Googleカレンダーのように、同じ時間帯に、イベントが重なった時には、幅を狭めて、
 * 全イベントが見えるようにするために、重なりを計算する。
 */
@injectable()
export class OverlapEventServiceImpl implements IOverlapEventService {
  execute(eventEntries: ReadonlyArray<EventEntry>): ReadonlyArray<OverlappedEventEntry> {
    // ソートして重なりをカウントする
    const sortedEvents: OverlappedEventEntry[] = eventEntries
      .filter((event) => event.start.dateTime)
      .map((event) => ({
        ...event,
        overlappingIndex: 0,
        overlappingCount: 0,
        startDateTime: eventDateTimeToDate(event.start),
        endDateTime: eventDateTimeToDate(event.end),
      }))
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
    // 同じ時間帯のイベントのグループ
    const eventGroups: OverlappedEventEntry[][] = [];
    for (const event of sortedEvents) {
      let placed = false;

      for (const group of eventGroups) {
        let overlapping = false;
        for (let i = 0; i < group.length; i++) {
          const existingEvent = group[i];
          if (this.checkOrverlapping(existingEvent, event)) {
            overlapping = true;
            break;
          }
        }
        if (overlapping) {
          event.overlappingIndex = group.length;
          group.push(event);
          placed = true;
          break;
        }
      }

      if (!placed) {
        event.overlappingIndex = 0;
        eventGroups.push([event]);
      }
    }
    eventGroups.forEach((group) => {
      group.forEach((event) => {
        event.overlappingCount = group.length;
      });
    });
    console.log('sortedEvents', sortedEvents);
    return sortedEvents;
  }

  private checkOrverlapping(event1: OverlappedEventEntry, event2: OverlappedEventEntry): boolean {
    if (event1.endDateTime.getTime() <= event2.startDateTime.getTime()) {
      return false;
    }
    if (event1.startDateTime.getTime() > event2.endDateTime.getTime()) {
      return false;
    }
    return true;
  }
}
