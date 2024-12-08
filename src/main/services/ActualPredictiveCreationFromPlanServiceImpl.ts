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

  async generatePredictedActual(start: Date, end: Date): Promise<EventEntry[]> {
    const userId = await this.userDetailsService.getUserId();
    const regularExpressionActuals: ProvisionalActual[] = [];

    const actuals = (await this.eventEntryService.list(userId, start, end))
      .filter((event) => event.deleted == null)
      .filter((event) => event.isProvisional == true)
      .filter((event) => event.eventType === EVENT_TYPE.ACTUAL)
      .filter((event) => event.start.dateTime != null && event.start.dateTime != undefined)
      .filter((event) => event.end.dateTime != null && event.end.dateTime != undefined);
    const plans = (await this.eventEntryService.list(userId, start, end))
      .filter((event) => event.deleted == null)
      .filter((event) => event.eventType === EVENT_TYPE.PLAN)
      .filter((event) => event.start.dateTime != null && event.start.dateTime != undefined)
      .filter((event) => event.end.dateTime != null && event.end.dateTime != undefined);
    if (plans.length === 0) return [];

    const patterns = (await this.planPatternService.list(PAGEABLE)).content;
    for (const plan of plans) {
      for (const pattern of patterns) {
        if (
          pattern.regularExpression != null &&
          new RegExp(pattern.regularExpression, 'g').test(plan.summary)
        ) {
          regularExpressionActuals.push({
            summary: plan.summary,
            start: plan.start,
            end: plan.end,
            categoryId: pattern.categoryId,
            labelIds: pattern.labelIds,
            updated: plan.updated,
          });
        }
      }
    }

    // 開始時刻が早い順にソート
    const sortRegularExpressionActuals = regularExpressionActuals.sort((d1, d2) => {
      // ブロック内でdateTimeがnullではないことを認識できないので、nullでないことを宣言する。
      const dateTime1 = d1.start.dateTime!;
      const dateTime2 = d2.start.dateTime!;
      if (dateTime1.getTime() !== dateTime2.getTime()) {
        return dateTime1.getTime() - dateTime2.getTime();
      } else {
        // 開始時刻が同じ場合は更新日を昇順でソートする。
        return d1.updated.getTime() - d2.updated.getTime();
      }
    });

    const provisionalActuals: EventEntry[] = [];
    let startDateTime: EventDateTime = sortRegularExpressionActuals[0].start;
    for (const regularExpressionActual of sortRegularExpressionActuals) {
      // ブロック内でdateTimeがnullではないことを認識できないので、nullでないことを宣言する。
      if (!regularExpressionActual.start.dateTime || !regularExpressionActual.end.dateTime) {
        continue;
      }
      if (
        startDateTime.dateTime &&
        regularExpressionActual.end.dateTime.getTime() < startDateTime.dateTime.getTime()
      ) {
        continue;
      }
      if (
        startDateTime.dateTime &&
        regularExpressionActual.start.dateTime.getTime() < startDateTime.dateTime.getTime()
      ) {
        regularExpressionActual.start = startDateTime;
      }
      // 既に仮実績が登録されていないか判定する
      let isAlreadyActual = false;
      for (const actual of actuals) {
        if (
          calculateOverlapTime(
            actual.start.dateTime,
            actual.end.dateTime,
            regularExpressionActual.start.dateTime,
            regularExpressionActual.end.dateTime
          ) > 0
        ) {
          isAlreadyActual = true;
          break;
        }
      }
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
      startDateTime = regularExpressionActual.end;
    }

    return provisionalActuals;
  }
}
