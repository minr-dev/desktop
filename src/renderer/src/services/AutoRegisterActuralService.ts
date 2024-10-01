import rendererContainer from './../inversify.config';
import { ActivityEvent } from '@shared/data/ActivityEvent';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { IAutoRegisterActualService } from './IAutoRegisterActualService';
import { injectable } from 'inversify';
import { TYPES } from '@renderer/types';
import { addHours } from 'date-fns';
import { IApplicationProxy } from './IApplicationProxy';
import { IEventEntryProxy } from './IEventEntryProxy';
import { calculateOverlapTime } from '@shared/utils/TimeUtil';
import { ILoggerFactory } from '@renderer/services/ILoggerFactory';

interface UsageData {
  id: string;
  usageTime: number;
}

@injectable()
export class AutoRegisterActualService implements IAutoRegisterActualService {
  async autoRegister(
    eventEntries: EventEntry[],
    activities: ActivityEvent[],
    targetDate: Date,
    userId: string
  ): Promise<EventEntry[]> {
    const provisionalActualPromises: Promise<EventEntry | null>[] = Array.from({ length: 24 }).map(
      (_, hour) => {
        const start = addHours(targetDate, hour);
        const end = addHours(start, 1);
        return this.createProvisionalActual(
          userId,
          start,
          end,
          eventEntries.filter((event) => event.eventType === EVENT_TYPE.PLAN),
          eventEntries.filter((event) => event.eventType === EVENT_TYPE.ACTUAL),
          activities
        );
      }
    );

    return Promise.all(provisionalActualPromises).then((actuals) =>
      actuals.filter((actual): actual is EventEntry => actual != null)
    );
  }

  /**
   * 指定の時間帯に仮実績を生成する
   *
   * @returns 仮実績を生成しない場合はnullを返す
   */
  private async createProvisionalActual(
    userId: string,
    start: Date,
    end: Date,
    plans: EventEntry[],
    actuals: EventEntry[],
    activities: ActivityEvent[]
  ): Promise<EventEntry | null> {
    const loggerFactory = rendererContainer.get<ILoggerFactory>(TYPES.LoggerFactory);
    const logger = loggerFactory.getLogger({ processType: 'renderer', loggerName: 'TaskEdit' });

    logger.info(`仮実績の生成：${start.getHours()}:00～`);
    const inTimeActuals = actuals.filter(
      (actual) => calculateOverlapTime(actual.start.dateTime, actual.end.dateTime, start, end) > 0
    );
    if (inTimeActuals.length > 0) {
      // 該当の時間帯に既に実績が登録されている場合は、仮実績の生成を行わない
      logger.info('実績登録済み');
      return null;
    }
    const inTimeActivities = activities.filter(
      (activity) => calculateOverlapTime(activity.start, activity.end, start, end) > 0
    );
    if (inTimeActivities.length === 0) {
      // 該当の時間帯にアクティビティがない場合は、仮実績の生成を行わない
      logger.info('アクティビティなし');
      return null;
    }

    /**
     * アプリに紐づけられたプロジェクト別に、該当の時間帯での使用時間を計算し、最も長いプロジェクトを割り当てる
     * カテゴリー、ラベルも同様に割り当てる
     */
    const applicationProxy = rendererContainer.get<IApplicationProxy>(TYPES.ApplicationProxy);
    const usageProjectMap = new Map<string, UsageData>();
    const usageCategoryMap = new Map<string, UsageData>();
    const usageLabelMap = new Map<string, UsageData>();
    for (const activity of inTimeActivities) {
      const application = await applicationProxy.getByName(activity.basename);
      if (application === null) {
        continue;
      }
      const usageTime = calculateOverlapTime(activity.start, activity.end, start, end);
      this.accumulateUsageTime(usageProjectMap, { id: application.relatedProjectId, usageTime });
      this.accumulateUsageTime(usageCategoryMap, { id: application.relatedCategoryId, usageTime });
      application.relatedLabelIds.forEach((relatedLabelId) =>
        this.accumulateUsageTime(usageLabelMap, { id: relatedLabelId, usageTime })
      );
    }

    const matchedProject = Array.from(usageProjectMap.values())
      .sort((p1, p2) => {
        return p2.usageTime - p1.usageTime;
      })
      .pop();
    const matchedCategory = Array.from(usageCategoryMap.values())
      .sort((c1, c2) => {
        return c2.usageTime - c1.usageTime;
      })
      .pop();
    // TODO: 実績にはラベルを複数貼れるので、複数取得することも考えたい
    const matchedLabel = Array.from(usageLabelMap.values())
      .sort((l1, l2) => {
        return l2.usageTime - l1.usageTime;
      })
      .pop();

    /**
     * タイトルの自動生成
     * 該当の時間帯に最も当てはまる予定からタイトルを取得する
     * TODO: アクティビティから生成したいが、いい方法が思いつかなかった
     */
    let summary: string;
    const inTimePlan = plans
      .filter(
        (plan) => calculateOverlapTime(plan.start.dateTime, plan.end.dateTime, start, end) > 0
      )
      .sort((p1, p2) => {
        return (
          calculateOverlapTime(p2.start.dateTime, p2.end.dateTime, start, end) -
          calculateOverlapTime(p1.start.dateTime, p1.end.dateTime, start, end)
        );
      })
      .pop();
    if (inTimePlan != null) {
      summary = inTimePlan.summary;
    } else {
      summary = '仮実績';
    }

    const eventEntryProxy = rendererContainer.get<IEventEntryProxy>(TYPES.EventEntryProxy);
    return eventEntryProxy
      .create(userId, EVENT_TYPE.ACTUAL, summary, { dateTime: start }, { dateTime: end }, true)
      .then((actual) => ({
        ...actual,
        projectId: matchedProject?.id,
        categoryId: matchedCategory?.id,
        labelIds: matchedLabel ? [matchedLabel.id] : null,
      }));
  }

  private accumulateUsageTime(map: Map<string, UsageData>, usage: UsageData): void {
    const preUsage = map.get(usage.id) ?? {
      id: usage.id,
      usageTime: 0,
    };
    map.set(usage.id, {
      ...preUsage,
      usageTime: preUsage.usageTime + usage.usageTime,
    });
  }
}
