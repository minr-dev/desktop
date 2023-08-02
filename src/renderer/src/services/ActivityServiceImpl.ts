import { inject, injectable } from 'inversify';

import { IActivityService } from './IActivityService';
import type { IActiveWindowLogProxy } from './IActiveWindowLogProxy';
import { TYPES } from '@renderer/types';
import { ActivityDetail, ActivityEvent } from '@shared/dto/ActivityEvent';

/**
 * タイムテーブルのアクティビティを取得するサービス
 *
 * アクティビティの元となるデータは、 ActiveWindowLog で、これを検索して、集約して、 ActivityEvent に変換する。
 * 集約は、basename の値が同じものが連続する場合には、それを1つにまとめて、ActivityDetail が明細リストとなって
 * details に格納される。
 */
@injectable()
export class ActivityServiceImpl implements IActivityService {
  constructor(
    @inject(TYPES.ActiveWindowLogProxy)
    private readonly activeWindowLogProxy: IActiveWindowLogProxy
  ) {}

  async fetchActivities(startDate: Date, endDate: Date): Promise<ActivityEvent[]> {
    const activeWindowLogs = await this.activeWindowLogProxy.list(startDate, endDate);
    const aggregatedLogs: ActivityEvent[] = [];
    let currentEvent: ActivityEvent | null = null;

    for (const winlog of activeWindowLogs) {
      if (currentEvent) {
        if (currentEvent.basename === winlog.basename) {
          if (currentEvent.end < winlog.deactivated) {
            currentEvent.end = winlog.deactivated;
          }
          const detail: ActivityDetail = {
            id: winlog.id,
            start: winlog.activated,
            end: winlog.deactivated,
            windowTitle: winlog.windowTitle,
          };
          currentEvent.details.push(detail);
        } else {
          currentEvent = null;
        }
      }
      if (!currentEvent) {
        const detail: ActivityDetail = {
          id: winlog.id,
          start: winlog.activated,
          end: winlog.deactivated,
          windowTitle: winlog.windowTitle,
        };
        currentEvent = {
          id: winlog.id,
          basename: winlog.basename,
          start: winlog.activated,
          end: winlog.deactivated,
          details: [detail],
        };
        aggregatedLogs.push(currentEvent);
      }
    }
    for (const event of aggregatedLogs) {
      console.log(event);
    }
    return aggregatedLogs;
  }
}
