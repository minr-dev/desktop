import { inject, injectable } from 'inversify';

import type { IWindowLogService } from './IWindowLogService';
import { TYPES } from '@main/types';
import { ActivityDetail, ActivityEvent } from '@shared/data/ActivityEvent';
import { IActivityService } from './IActivityService';
import { WindowLog, SYSTEM_IDLE_PID } from '@shared/data/WindowLog';
import type { IActivityColorService } from './IActivityColorService';

/**
 * アクティビティを取得するサービス
 *
 * アクティビティの元となるデータは、 WindowLog で、これを検索して、集約して、 ActivityEvent に変換する。
 * 集約は、basename の値が同じものが連続する場合には、それを1つにまとめて、ActivityDetail が明細リストとなって
 * details に格納される。
 */
@injectable()
export class ActivityServiceImpl implements IActivityService {
  constructor(
    @inject(TYPES.WindowLogService)
    private readonly windowLogService: IWindowLogService,
    @inject(TYPES.ActivityColorService)
    private readonly activityColorService: IActivityColorService
  ) {}

  async fetchActivities(startDate: Date, endDate: Date): Promise<ActivityEvent[]> {
    const winLogs = await this.windowLogService.list(startDate, endDate);
    const aggregatedLogs: ActivityEvent[] = [];
    let currentEvent: ActivityEvent | null = null;

    for (const winlog of winLogs) {
      // アイドル状態の場合は、アクティビティには含めない
      if (winlog.pid === SYSTEM_IDLE_PID) {
        if (currentEvent) {
          currentEvent = null;
        }
        continue;
      }
      if (currentEvent) {
        if (!this.updateActivityEvent(currentEvent, winlog)) {
          currentEvent = null;
        }
      }
      if (!currentEvent) {
        currentEvent = await this.createActivityEvent(winlog);
        aggregatedLogs.push(currentEvent);
      }
    }
    // for (const event of aggregatedLogs) {
    //   console.log(event);
    // }
    return aggregatedLogs;
  }

  async createActivityEvent(winlog: WindowLog): Promise<ActivityEvent> {
    const detail = this.createDetail(winlog);
    const appColor = await this.getAppColor(winlog);
    return {
      id: winlog.id,
      basename: winlog.basename,
      start: winlog.activated,
      end: winlog.deactivated,
      details: [detail],
      appColor: appColor,
    };
  }

  updateActivityEvent(activityEvent: ActivityEvent, winlog: WindowLog): boolean {
    if (activityEvent.basename === winlog.basename) {
      if (activityEvent.end < winlog.deactivated) {
        activityEvent.end = winlog.deactivated;
      }
      const detail = this.createDetail(winlog);
      activityEvent.details.push(detail);
      return true;
    }
    return false;
  }

  private createDetail(winlog: WindowLog): ActivityDetail {
    return {
      id: winlog.id,
      start: winlog.activated,
      end: winlog.deactivated,
      windowTitle: winlog.windowTitle,
    };
  }

  async getLastActivity(startDate: Date, endDate: Date): Promise<ActivityEvent | undefined> {
    const winLogs = await this.windowLogService.list(startDate, endDate);
    if (winLogs.length === 0) {
      return undefined;
    }
    const lastBasename = winLogs[winLogs.length - 1].basename;
    const details: ActivityDetail[] = [];
    for (let i = winLogs.length - 1; i >= 0; i--) {
      const winlog = winLogs[i];
      if (winlog.basename === lastBasename) {
        const detail: ActivityDetail = {
          id: winlog.id,
          start: winlog.activated,
          end: winlog.deactivated,
          windowTitle: winlog.windowTitle,
        };
        details.push(detail);
      } else {
        break;
      }
    }
    const event: ActivityEvent = {
      id: details[0].id,
      basename: lastBasename,
      start: details[details.length - 1].start,
      end: details[0].end,
      details: details.reverse(),
      appColor: await this.getAppColor(winLogs[winLogs.length - 1]),
    };
    return event;
  }

  private async getAppColor(winlog: WindowLog): Promise<string | null> {
    let appColor: string | null = null;
    if (winlog.path) {
      let activityColor = await this.activityColorService.get(winlog.basename);
      if (!activityColor) {
        activityColor = await this.activityColorService.create(winlog.basename);
        activityColor = await this.activityColorService.save(activityColor);
      }
      appColor = activityColor.appColor;
    }
    return appColor;
  }
}
