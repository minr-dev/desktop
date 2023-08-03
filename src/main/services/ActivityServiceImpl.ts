import { inject, injectable } from 'inversify';

import type { IActiveWindowLogService } from './IActiveWindowLogService';
import { TYPES } from '@main/types';
import { ActivityDetail, ActivityEvent } from '@shared/dto/ActivityEvent';
import { IActivityService } from './IActivityService';
import { ActiveWindowLog } from '@shared/dto/ActiveWindowLog';

/**
 * アクティビティを取得するサービス
 *
 * アクティビティの元となるデータは、 ActiveWindowLog で、これを検索して、集約して、 ActivityEvent に変換する。
 * 集約は、basename の値が同じものが連続する場合には、それを1つにまとめて、ActivityDetail が明細リストとなって
 * details に格納される。
 */
@injectable()
export class ActivityServiceImpl implements IActivityService {
  constructor(
    @inject(TYPES.ActiveWindowLogService)
    private readonly activeWindowLogService: IActiveWindowLogService
  ) {}

  async fetchActivities(startDate: Date, endDate: Date): Promise<ActivityEvent[]> {
    const activeWindowLogs = await this.activeWindowLogService.list(startDate, endDate);
    const aggregatedLogs: ActivityEvent[] = [];
    let currentEvent: ActivityEvent | null = null;

    for (const winlog of activeWindowLogs) {
      if (currentEvent) {
        if (!this.updateActivityEvent(currentEvent, winlog)) {
          currentEvent = null;
        }
      }
      if (!currentEvent) {
        currentEvent = this.createActivityEvent(winlog);
        aggregatedLogs.push(currentEvent);
      }
    }
    // for (const event of aggregatedLogs) {
    //   console.log(event);
    // }
    return aggregatedLogs;
  }

  createActivityEvent(winlog: ActiveWindowLog): ActivityEvent {
    const detail = this.createDetail(winlog);
    return {
      id: winlog.id,
      basename: winlog.basename,
      start: winlog.activated,
      end: winlog.deactivated,
      details: [detail],
    };
  }

  updateActivityEvent(activityEvent: ActivityEvent, winlog: ActiveWindowLog): boolean {
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

  private createDetail(winlog: ActiveWindowLog): ActivityDetail {
    return {
      id: winlog.id,
      start: winlog.activated,
      end: winlog.deactivated,
      windowTitle: winlog.windowTitle,
    };
  }

  async getLastActivity(startDate: Date, endDate: Date): Promise<ActivityEvent | undefined> {
    const activeWindowLogs = await this.activeWindowLogService.list(startDate, endDate);
    if (activeWindowLogs.length === 0) {
      return undefined;
    }
    const lastBasename = activeWindowLogs[activeWindowLogs.length - 1].basename;
    const details: ActivityDetail[] = [];
    for (let i = activeWindowLogs.length - 1; i >= 0; i--) {
      const winlog = activeWindowLogs[i];
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
    };
    return event;
  }
}
