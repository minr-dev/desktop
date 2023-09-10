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
  execute(eventTimeCells: ReadonlyArray<EventTimeCell>): EventTimeCell[] {
    // ソートして重なりをカウントする
    const sortedCells = [...eventTimeCells].sort(
      (a, b) => a.cellFrameStart.getTime() - b.cellFrameStart.getTime()
    );
    // 同じ時間帯のイベントのグループ
    const cellGroups: EventTimeCell[][] = [];
    for (const eventCell of sortedCells) {
      let placed = false;

      for (const cellGroup of cellGroups) {
        let overlapping = false;
        for (let i = 0; i < cellGroup.length; i++) {
          const existingEvent = cellGroup[i];
          if (this.checkOrverlapping(existingEvent, eventCell)) {
            overlapping = true;
            break;
          }
        }
        if (overlapping) {
          eventCell.overlappingIndex = cellGroup.length;
          cellGroup.push(eventCell);
          placed = true;
          break;
        }
      }

      if (!placed) {
        eventCell.overlappingIndex = 0;
        cellGroups.push([eventCell]);
      }
    }
    for (const cellGroup of cellGroups) {
      for (const eventCell of cellGroup) {
        eventCell.overlappingCount = cellGroup.length;
      }
    }
    this.reGrouping(cellGroups);
    return sortedCells;
  }

  /**
   * 同時間帯のグループの再グループ化
   *
   * 隙間を埋めて列数を削減する
   *
   * ■処理前の状態 (phase1)
   * 10:00  +------+
   *        |event1| +------+
   * 10:30  +------+ |event2|
   *                 |      |
   * 11:00           |      | +------+
   *                 +------+ |event3|
   * 11:30                    +------+
   *
   * ■処理後の状態 (phase2)
   * 10:00  +------+
   *        |event1| +------+
   * 10:30  +------+ |event2|
   *                 |      |
   * 11:00  +------+ |      |
   *        |event3| +------+
   * 11:30  +------+
   *
   * 具体的には、overlappingIndex と overlappingCount を再計算することで再配置する
   * event3 の overlappingIndex は 2 から 0 になり、
   * event1 から event3 までの overlappingCount は 3 から 2 になる
   */
  private reGrouping(cellGroups: EventTimeCell[][]): void {
    for (const cellGroup of cellGroups) {
      // cellGroup.forEach((cell) => {
      //   const s = format(cell.cellFrameStart, 'HH:mm');
      //   const e = format(cell.endTime, 'HH:mm');
      //   const fe = format(cell.cellFrameEnd, 'HH:mm');
      //   console.log(
      //     'before',
      //     `${cell.id}:`,
      //     `${s} - ${fe} (${e})`,
      //     `${cell.overlappingIndex}/${cell.overlappingCount}}`
      //   );
      // });
      const bottoms: (EventTimeCell | null)[] = [...cellGroup];
      for (let i = 1; i < cellGroup.length; i++) {
        const rightCell = cellGroup[i];
        let targetIndex = -1;
        let moveIndex = -1;
        for (let j = 0; j < i; j++) {
          const leftCell = bottoms[j];
          if (leftCell === null) {
            continue;
          }
          if (!this.checkOrverlapping(rightCell, leftCell)) {
            // console.log('not overlapping', leftCell.overlappingIndex, rightCell.overlappingIndex);
            targetIndex = i;
            moveIndex = leftCell.overlappingIndex;
            bottoms[moveIndex] = rightCell;
            bottoms[targetIndex] = null;
            break;
          }
        }
        if (targetIndex !== -1) {
          for (let j = 0; j < cellGroup.length; j++) {
            const cell = cellGroup[j];
            cell.overlappingCount--;
            if (targetIndex === j) {
              cell.overlappingIndex = moveIndex;
            }
            if (targetIndex < j) {
              cell.overlappingIndex--;
            }
          }
        }
      }
      // cellGroup.forEach((cell) => {
      //   const s = format(cell.cellFrameStart, 'HH:mm');
      //   const e = format(cell.endTime, 'HH:mm');
      //   const fe = format(cell.cellFrameEnd, 'HH:mm');
      //   console.log(
      //     'after',
      //     `${cell.id}:`,
      //     `${s} - ${fe} (${e})`,
      //     `${cell.overlappingIndex}/${cell.overlappingCount}}`
      //   );
      // });
    }
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
