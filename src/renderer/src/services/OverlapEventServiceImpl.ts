import { injectable } from 'inversify';
import { IOverlapEventService } from './IOverlapEventService';
import { EventTimeCell } from './EventTimeCell';

/**
 * イベントの重なりを計算するサービス
 *
 * Googleカレンダーのように、同じ時間帯に、イベントが重なった時には、幅を狭めて、
 * 全イベントが見えるようにするために、重なりを計算する。
 */
@injectable()
export class OverlapEventServiceImpl implements IOverlapEventService {
  execute(eventTimeCells: ReadonlyArray<EventTimeCell>): ReadonlyArray<EventTimeCell> {
    // ソートして重なりをカウントする
    const sortedCells = [...eventTimeCells].sort(
      (a, b) => a.cellFrameStart.getTime() - b.cellFrameStart.getTime()
    );
    // 同じ時間帯のイベントのグループ
    const eventGroups: EventTimeCell[][] = [];
    for (const event of sortedCells) {
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
    // console.log('sortedEvents', sortedCells);
    return sortedCells;
  }

  private checkOrverlapping(event1: EventTimeCell, event2: EventTimeCell): boolean {
    if (event1.cellFrameEnd.getTime() <= event2.cellFrameStart.getTime()) {
      return false;
    }
    if (event1.cellFrameStart.getTime() > event2.cellFrameEnd.getTime()) {
      return false;
    }
    return true;
  }
}
