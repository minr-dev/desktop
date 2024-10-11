import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { calculateOverlapTime } from '@shared/utils/TimeUtil';
import type { IUserDetailsService } from './IUserDetailsService';
import type { IActivityService } from './IActivityService';
import type { IPatternService } from './IPatternService';
import { EventEntryFactory } from './EventEntryFactory';
import { Pageable } from '@shared/data/Page';
import type { ITaskService } from './ITaskService';
import { IActualPredictiveCreationService } from './IActualPredictiveCreationService';
import type { IEventEntryService } from './IEventEntryService';

/**
 * パターンで合致したプロジェクト・カテゴリー・ラベル・タスクのidと、
 * それに紐づくアクティビティの合計時間の関係として用いる
 */
interface UsageData {
  id: string;
  usageTime: number;
}

const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);

/**
 * アクティビティから、実績1つを自動生成するクラス
 * 実績の自動登録処理全体の中でどのように使われるかについては以下参照
 * @see ActualAutoRegistrationServiceImpl
 */
@injectable()
export class ActualPredictiveCreationServiceImpl implements IActualPredictiveCreationService {
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
    private readonly taskService: ITaskService
  ) {}

  /**
   * 指定の時間帯に仮実績を生成する
   *
   * @param tasks タスクに紐づくプロジェクトを確認するために用いる
   *
   * @returns 仮実績を生成しない場合はnullを返す
   */
  async generatePredictedActual(start: Date, end: Date): Promise<EventEntry | null> {
    const userId = await this.userDetailsService.getUserId();

    const actuals = (await this.eventEntryService.list(userId, start, end))
      .filter((event) => event.deleted == null)
      .filter((event) => event.eventType === EVENT_TYPE.ACTUAL);

    if (this.actualAlreadyExists(start, end, actuals)) {
      // 該当の時間帯に既に実績が登録されている場合は、仮実績の生成を行わない
      return null;
    }

    const activities = await this.activityService.fetchActivities(start, end);

    if (activities.length === 0) {
      // 該当の時間帯にアクティビティがない場合は、仮実績の生成を行わない
      return null;
    }

    const patterns = (await this.patternService.list(PAGEABLE)).content;
    const taskIds = patterns
      .map((pattern) => pattern.taskId)
      .filter((id): id is string => id != null);
    const tasks = (await this.taskService.list(PAGEABLE)).content.filter((task) =>
      taskIds.includes(task.id)
    );

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

    for (const activity of activities) {
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
      return data.sort((d1, d2) => {
        return d2.usageTime - d1.usageTime;
      })[0]?.id;
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

    const DEFAULT_SUMMARY = '仮実績';

    return EventEntryFactory.create({
      userId: userId,
      eventType: EVENT_TYPE.ACTUAL,
      summary: DEFAULT_SUMMARY,
      start: { dateTime: start },
      end: { dateTime: end },
      isProvisional: true,
      projectId: matchedProjectId ?? null,
      categoryId: matchedCategoryId ?? null,
      labelIds: matchedLabelId ? [matchedLabelId] : null,
      taskId: matchedTaskId ?? null,
    });
  }

  private actualAlreadyExists(start: Date, end: Date, actuals: EventEntry[]): boolean {
    const inTimeActuals = actuals.filter(
      (actual) => calculateOverlapTime(actual.start.dateTime, actual.end.dateTime, start, end) > 0
    );
    return inTimeActuals.length > 0;
  }
}
