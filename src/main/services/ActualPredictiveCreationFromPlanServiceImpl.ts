import { inject, injectable } from 'inversify';
import { IActualPredictiveCreationFromPlanService } from './IActualPredictiveCreationFromPlanService';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { TYPES } from '@main/types';
import type { IUserDetailsService } from './IUserDetailsService';
import type { IEventEntryService } from './IEventEntryService';
import type { IPlanPatternService } from './IPlanPatternService';
import { EventEntryFactory } from './EventEntryFactory';
import { Pageable } from '@shared/data/Page';
import { EventDateTime } from '@shared/data/EventDateTime';
import { calculateOverlapTime } from '@shared/utils/TimeUtil';

const PAGEABLE = new Pageable(0, Number.MAX_SAFE_INTEGER);

// 仮実績の登録用インターフェイス
interface ProvisionalActual {
  summary: string;
  start: EventDateTime;
  end: EventDateTime;
  categoryId?: string | null;
  labelIds?: string[] | null;
  updated: Date;
}

/**
 * 予定から、実績を自動生成するクラス
 * 実績の自動登録処理全体の中でどのように使われるかについては以下参照
 * @see ActualAutoRegistrationServiceImpl
 */
@injectable()
export class ActualPredictiveCreationFromPlanServiceImpl
  implements IActualPredictiveCreationFromPlanService
{
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService,
    @inject(TYPES.PlanPatternService)
    private readonly planPatternService: IPlanPatternService
  ) {}

  /**
   * 指定の時間帯に仮実績を生成する
   *
   * @param start 開始日時
   * @param end 終了日時
   * @returns 予定から作成した仮実績の配列
   */
  async generatePredictedActual(start: Date, end: Date): Promise<void> {
    const userId = await this.userDetailsService.getUserId();
    const regularExpressionActuals: ProvisionalActual[] = [];

    const patterns = (await this.planPatternService.list(PAGEABLE)).content;
    if (patterns.length === 0) return;

    const plans = (await this.eventEntryService.list(userId, start, end))
      .filter((event) => event.deleted == null)
      .filter((event) => event.eventType === EVENT_TYPE.PLAN)
      .filter((event) => event.start.dateTime != null)
      .filter((event) => event.end.dateTime != null);
    if (plans.length === 0) return;

    for (const plan of plans) {
      for (const pattern of patterns) {
        if (
          pattern.regularExpression != null &&
          new RegExp(pattern.regularExpression, 'g').test(plan.summary) &&
          pattern.categoryId === plan.categoryId &&
          this.isStringArrayEqual(pattern.labelIds, plan.labelIds)
        ) {
          regularExpressionActuals.push({
            summary: plan.summary,
            start: plan.start,
            end: plan.end,
            categoryId: plan.categoryId,
            labelIds: plan.labelIds,
            updated: plan.updated,
          });
          continue;
        }
      }
    }
    if (regularExpressionActuals.length === 0) return;

    // 開始時刻が早い順にソート
    const sortRegularExpressionActuals = regularExpressionActuals.sort((d1, d2) => {
      try {
        if (d1.start.dateTime!.getTime() !== d2.start.dateTime!.getTime()) {
          return d1.start.dateTime!.getTime() - d2.start.dateTime!.getTime();
        } else {
          // 開始時刻が同じ場合は更新日を昇順でソートする。
          return d1.updated.getTime() - d2.updated.getTime();
        }
      } catch (e) {
        if (!d1.start.dateTime || !d2.start.dateTime) {
          throw new ReferenceError(`dateTime is null.`, e as Error);
        }
        throw e;
      }
    });

    const provisionalActuals: EventEntry[] = [];
    const alreadyProvisionalActuals = (await this.eventEntryService.list(userId, start, end))
      .filter((event) => event.deleted == null)
      .filter((event) => event.isProvisional == true)
      .filter((event) => event.eventType === EVENT_TYPE.ACTUAL)
      .filter((event) => event.start.dateTime != null)
      .filter((event) => event.end.dateTime != null);
    const alreadyActuals = (await this.eventEntryService.list(userId, start, end))
      .filter((event) => event.deleted == null)
      .filter((event) => event.isProvisional == false)
      .filter((event) => event.eventType === EVENT_TYPE.ACTUAL);
    let beforePlanEndDateTime: Date = sortRegularExpressionActuals[0].start.dateTime!;
    for (const regularExpressionActual of sortRegularExpressionActuals) {
      try {
        if (
          regularExpressionActual.end.dateTime!.getTime() < beforePlanEndDateTime.getTime()
        ) {
          continue;
        }
        if (
          regularExpressionActual.start.dateTime!.getTime() < beforePlanEndDateTime.getTime()
        ) {
          regularExpressionActual.start.dateTime = beforePlanEndDateTime;
        }
        // 既に仮実績が登録されていないか判定する
        const isAlreadyProvisionalActuals = alreadyProvisionalActuals.some(
          (actual) =>
            calculateOverlapTime(
              actual.start.dateTime,
              actual.end.dateTime,
              regularExpressionActual.start.dateTime,
              regularExpressionActual.end.dateTime
            ) > 0
        );
        if (isAlreadyProvisionalActuals) continue;
        // 同じ名称・日時の実績が登録されていないか判定する
        const isAlreadyActual = alreadyActuals.some(
          (actual) =>
            regularExpressionActual.start.dateTime != null &&
            regularExpressionActual.end.dateTime != null &&
            actual.start.dateTime != null &&
            actual.end.dateTime != null &&
            regularExpressionActual.start.dateTime.getTime() === actual.start.dateTime.getTime() &&
            regularExpressionActual.end.dateTime.getTime() === actual.end.dateTime.getTime() &&
            regularExpressionActual.summary === actual.summary
        );
        if (isAlreadyActual) continue;
        const eventEntry = EventEntryFactory.create({
          userId: userId,
          eventType: EVENT_TYPE.ACTUAL,
          summary: regularExpressionActual.summary,
          start: regularExpressionActual.start,
          end: regularExpressionActual.end,
          isProvisional: true,
          projectId: null,
          categoryId: regularExpressionActual.categoryId,
          labelIds: regularExpressionActual.labelIds,
          taskId: null,
        });
        provisionalActuals.push(eventEntry);
        beforePlanEndDateTime = regularExpressionActual.end.dateTime!;
      } catch (e) {
        if (!regularExpressionActual.start.dateTime || !regularExpressionActual.end.dateTime) {
          throw new ReferenceError(`dateTime is null.`, e as Error);
        }
        throw e;
      }
    }
    await Promise.all(provisionalActuals.map((actual) => this.eventEntryService.save(actual)));
  }

  /**
   * 文字配列の要素が一致しているか判定する
   *
   * @param array1
   * @param array2
   * @returns boolean
   */
  private isStringArrayEqual(
    array1: string[] | null | undefined,
    array2: string[] | null | undefined
  ): boolean {
    if (!array1 && !array2) return true;
    if (!array1 || !array2) return false;
    if (array1.length != array2.length) return false;

    const sortArray1 = array1.sort();
    const sortArray2 = array2.sort();
    for (let num = 0; num < sortArray1.length; num++) {
      if (sortArray1[num] != sortArray2[num]) return false;
    }
    return true;
  }
}
