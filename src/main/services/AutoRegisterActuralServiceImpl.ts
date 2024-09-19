import { ActivityEvent } from '@shared/data/ActivityEvent';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { IAutoRegisterActualService } from './IAutoRegisterActualService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { addDays, addHours, format } from 'date-fns';
import { calculateOverlapTime } from '@shared/utils/TimeUtil';
import type { IUserDetailsService } from './IUserDetailsService';
import type { IEventEntryService } from './IEventEntryService';
import type { IActivityService } from './IActivityService';
import type { IPatternService } from './IPatternService';
import { EventEntryFactory } from './EventEntryFactory';
import { Pageable } from '@shared/data/Page';
import { Pattern } from '@shared/data/Pattern';
import type { ITaskService } from './ITaskService';
import { Task } from '@shared/data/Task';
import type { IOverlapEventMergeService } from './IOverlapEventMergeService';

/**
 * パターンで合致したプロジェクト・カテゴリー・ラベル・タスクのidと、
 * それに紐づくアクティビティの合計時間の関係として用いる
 */
interface UsageData {
  id: string;
  usageTime: number;
}

const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);

@injectable()
export class AutoRegisterActualServiceImpl implements IAutoRegisterActualService {
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService,
    @inject(TYPES.ActivityService)
    private readonly activityService: IActivityService,
    @inject(TYPES.PatternService)
    private readonly patternService: IPatternService,
    @inject(TYPES.TaskService)
    private readonly taskService: ITaskService,
    @inject(TYPES.OverlapEventMergeService)
    private readonly overlapEventMergeService: IOverlapEventMergeService
  ) {}

  async autoRegisterProvisionalActuals(targetDate: Date): Promise<EventEntry[]> {
    const userId = await this.userDetailsService.getUserId();

    const eventEntries = (
      await this.eventEntryService.list(userId, targetDate, addDays(targetDate, 1))
    ).filter((event) => event.deleted == null);
    const plans = eventEntries.filter(
      (event) => event.eventType === EVENT_TYPE.PLAN || event.eventType === EVENT_TYPE.SHARED
    );
    const actuals = eventEntries.filter((event) => event.eventType === EVENT_TYPE.ACTUAL);

    const activities = await this.activityService.fetchActivities(
      targetDate,
      addDays(targetDate, 1)
    );

    const patterns = (await this.patternService.list(PAGEABLE)).content;
    const taskIds = patterns
      .map((pattern) => pattern.taskId)
      .filter((id): id is string => id != null);
    const tasks = (await this.taskService.list(PAGEABLE)).content.filter((task) =>
      taskIds.includes(task.id)
    );

    const provisionalActualsBeforeMerge = Array.from({ length: 24 })
      .map((_, hour) => {
        const start = addHours(targetDate, hour);
        const end = addHours(start, 1);

        if (this.actualAlreadyExists(start, end, actuals)) {
          // 該当の時間帯に既に実績が登録されている場合は、仮実績の生成を行わない
          console.log('実績登録済み');
          return null;
        }

        return this.createProvisionalActual(userId, start, end, activities, patterns, tasks);
      })
      .filter((actual): actual is EventEntry => actual != null);

    const provisionalActuals = this.overlapEventMergeService
      .mergeOverlapEvent(provisionalActualsBeforeMerge)
      .map((actual) => ({ ...actual, summary: this.autoRegisterSummary(actual, plans) }));

    await Promise.all(provisionalActuals.map((actual) => this.eventEntryService.save(actual)));
    return provisionalActuals;
  }

  private actualAlreadyExists(start: Date, end: Date, actuals: EventEntry[]): boolean {
    const inTimeActuals = actuals.filter(
      (actual) => calculateOverlapTime(actual.start.dateTime, actual.end.dateTime, start, end) > 0
    );
    return inTimeActuals.length > 0;
  }

  /**
   * 指定の時間帯に仮実績を生成する
   *
   * @param actuals 同じ時間帯に実績が生成されているかを確認する
   * @param tasks タスクに紐づくプロジェクトを確認するために用いる
   *
   * @returns 仮実績を生成しない場合はnullを返す
   */
  private createProvisionalActual(
    userId: string,
    start: Date,
    end: Date,
    activities: ActivityEvent[],
    patterns: Pattern[],
    tasks: Task[]
  ): EventEntry | null {
    console.log(`仮実績の生成：${format(start, 'HH:mm')}～${format(end, 'HH:mm')}`);

    const inTimeActivities = activities.filter(
      (activity) => calculateOverlapTime(activity.start, activity.end, start, end) > 0
    );
    if (inTimeActivities.length === 0) {
      // 該当の時間帯にアクティビティがない場合は、仮実績の生成を行わない
      console.log('アクティビティなし');
      return null;
    }
    /**
     * アプリに紐づけられたプロジェクト別に、該当の時間帯での使用時間を計算し、最も長いプロジェクトを割り当てる
     * カテゴリー、ラベルも同様に割り当てる
     */
    const usageProjectMap = new Map<string, UsageData>();
    const usageCategoryMap = new Map<string, UsageData>();
    const usageLabelMap = new Map<string, UsageData>();
    const usageTaskMap = new Map<string, UsageData>();

    const accumulateUsageTime = (map: Map<string, UsageData>, usage: UsageData): void => {
      const preUsage = map.get(usage.id) ?? {
        id: usage.id,
        usageTime: 0,
      };
      map.set(usage.id, {
        ...preUsage,
        usageTime: preUsage.usageTime + usage.usageTime,
      });
    };

    for (const activity of inTimeActivities) {
      const inTimeDetails = activity.details.filter(
        (detail) => calculateOverlapTime(detail.start, detail.end, start, end) > 0
      );
      for (const detail of inTimeDetails) {
        const matchedPatterns = patterns
          .filter((p) => p.basename === activity.basename)
          .filter(
            (p) =>
              p.regularExpression == null ||
              new RegExp(p.regularExpression, 'g').test(detail.windowTitle)
          );
        for (const pattern of matchedPatterns) {
          const usageTime = calculateOverlapTime(detail.start, detail.end, start, end);
          if (pattern.projectId != null) {
            accumulateUsageTime(usageProjectMap, { id: pattern.projectId, usageTime });
          }
          if (pattern.categoryId != null) {
            accumulateUsageTime(usageCategoryMap, { id: pattern.categoryId, usageTime });
          }
          if (pattern.labelIds != null) {
            pattern.labelIds.forEach((labelId) =>
              accumulateUsageTime(usageLabelMap, { id: labelId, usageTime })
            );
          }
          if (pattern.taskId != null) {
            accumulateUsageTime(usageTaskMap, { id: pattern.taskId, usageTime });
          }
        }
      }
    }

    // UsageDataの配列から、usageTimeが最大のデータのIdを取得する
    const getMatchedId = (data: UsageData[]): string | undefined => {
      return data
        .sort((d1, d2) => {
          return d2.usageTime - d1.usageTime;
        })
        .pop()?.id;
    };

    const matchedProjectId = getMatchedId(Array.from(usageProjectMap.values()));
    const matchedCategoryId = getMatchedId(Array.from(usageCategoryMap.values()));
    const matchedLabelId = getMatchedId(Array.from(usageLabelMap.values()));

    // 割り当てたプロジェクトに紐づくものに限定して、タスクの割り当てを決める
    const isRelatedWithMatchedProject = (taskId: string): boolean => {
      if (matchedProjectId == null) {
        return false;
      }
      const task = tasks.filter((t) => t.id === taskId).pop();
      if (task == null) {
        return false;
      }
      return task.projectId === matchedProjectId;
    };
    const matchedTaskId = getMatchedId(
      Array.from(usageTaskMap.values()).filter((t) => isRelatedWithMatchedProject(t.id))
    );

    // タイトルを先に割り当てると、予定からはみ出た実績のマージがうまくいかなくなる
    // そのため、ここでは仮のタイトルをつけて、マージ後に改めてタイトルを割り当てる
    const defaultSummary = '仮実績';

    return EventEntryFactory.create({
      userId: userId,
      eventType: EVENT_TYPE.ACTUAL,
      summary: defaultSummary,
      start: { dateTime: start },
      end: { dateTime: end },
      isProvisional: true,
      projectId: matchedProjectId ?? null,
      categoryId: matchedCategoryId ?? null,
      labelIds: matchedLabelId ? [matchedLabelId] : null,
      taskId: matchedTaskId ?? null,
    });
  }

  /**
   * タイトルの自動生成
   * 該当の時間帯に最も当てはまる予定からタイトルを取得する
   * ただし、割り当てたプロジェクト等が予定と異なる場合はデフォルトのタイトルにする
   */
  private autoRegisterSummary(event: EventEntry, plans: EventEntry[]): string {
    const matchedPlan = plans
      .filter(
        (plan) =>
          calculateOverlapTime(
            plan.start.dateTime,
            plan.end.dateTime,
            event.start.dateTime,
            event.end.dateTime
          ) > 0
      )
      .filter(
        (plan) =>
          (event.projectId == null || plan.projectId === event.projectId) &&
          (event.categoryId == null || plan.categoryId === event.categoryId) &&
          (event.labelIds == null ||
            event.labelIds.every((labelId) => plan.labelIds?.includes(labelId))) &&
          (event.taskId == null || plan.taskId === event.taskId)
      )
      .sort((p1, p2) => {
        // 実績の時間帯に含まれる予定の時間を比較
        return (
          calculateOverlapTime(
            p2.start.dateTime,
            p2.end.dateTime,
            event.start.dateTime,
            event.end.dateTime
          ) -
          calculateOverlapTime(
            p1.start.dateTime,
            p1.end.dateTime,
            event.start.dateTime,
            event.end.dateTime
          )
        );
      })
      .pop();
    return matchedPlan ? matchedPlan.summary : event.summary;
  }

  private async getProvisionalActuals(targetDate: Date): Promise<EventEntry[]> {
    const userId = await this.userDetailsService.getUserId();
    const start = targetDate;
    const end = addDays(start, 1);
    const eventEntries = await this.eventEntryService.list(userId, start, end);
    return eventEntries
      .filter((event) => event.eventType === EVENT_TYPE.ACTUAL)
      .filter((event) => event.isProvisional);
  }

  /**
   * 1日分の仮実績を全て本登録状態にする
   *
   * @param targetDate
   */
  async confirmActualRegistration(targetDate: Date): Promise<void> {
    const provisionalActuals = await this.getProvisionalActuals(targetDate);
    for (const provisionalActual of provisionalActuals) {
      this.eventEntryService.save({ ...provisionalActual, isProvisional: false });
    }
  }

  /**
   * 1日分の仮実績を全て削除にする
   *
   * @param targetDate
   */
  async deleteProvisionalActuals(targetDate: Date): Promise<void> {
    const provisionalActuals = await this.getProvisionalActuals(targetDate);
    for (const provisionalActual of provisionalActuals) {
      this.eventEntryService.delete(provisionalActual.id);
    }
  }
}
