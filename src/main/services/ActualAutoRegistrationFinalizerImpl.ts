import { EventEntry } from '@shared/data/EventEntry';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { calculateOverlapTime } from '@shared/utils/TimeUtil';
import type { IUserDetailsService } from './IUserDetailsService';
import type { IEventEntryService } from './IEventEntryService';
import { IActualAutoRegistrationFinalizer } from './IActualAutoRegistrationFinalizer';

/**
 * 実績の自動登録プロセスの、実績のマージ後の処理をするクラス
 * ここではタイトルの割り当てと、DBへの仮実績の保存を行っている。
 * 実績の自動登録処理全体の中でどのように使われるかについては以下参照
 * @see ActualAutoRegistrationServiceImpl
 */
@injectable()
export class ActualAutoRegistrationFinalizerImpl implements IActualAutoRegistrationFinalizer {
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService
  ) {}

  async finalizeRegistration(mergedActuals: EventEntry[]): Promise<void> {
    const userId = await this.userDetailsService.getUserId();

    // mergedActualの中で最も早い開始時刻と最も遅い終了時刻を取得
    const start = mergedActuals
      .map((actual) => actual.start.dateTime)
      .filter((date): date is Date => date != null)
      .sort((d1, d2) => d2.getTime() - d1.getTime())[0];
    const end = mergedActuals
      .map((actual) => actual.end.dateTime)
      .filter((date): date is Date => date != null)
      .sort((d1, d2) => d1.getTime() - d2.getTime())[0];

    const plans =
      start != null && end != null ? await this.eventEntryService.list(userId, start, end) : [];

    const mergedActualsWithTitle = mergedActuals.map((actual) => ({
      ...actual,
      summary: this.autoRegisterSummary(actual, plans),
    }));
    // TODO: DAOで一括保存処理を実装して、一括で保存できるようにする
    await Promise.all(mergedActualsWithTitle.map((actual) => this.eventEntryService.save(actual)));
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
      })[0];
    return matchedPlan ? matchedPlan.summary : event.summary;
  }
}
