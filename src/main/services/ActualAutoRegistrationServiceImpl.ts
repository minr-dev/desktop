import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { IActualAutoRegistrationService } from './IAutoRegisterActualService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { addDays, addHours } from 'date-fns';
import type { IUserDetailsService } from './IUserDetailsService';
import type { IEventEntryService } from './IEventEntryService';
import type { IOverlapEventMergeService } from './IOverlapEventMergeService';
import type { IActualPredictiveCreationService } from './IActualPredictiveCreationService';
import type { IActualAutoRegistrationFinalizer } from './IActualAutoRegistrationFinalizer';

/**
 * 実績の自動登録を行うサービスクラス
 *
 * 自動生成のプロセスに用いるクラスの役割
 * - ActualPredictiveCreationService
 *   - 引数で指定した時間帯に実績を生成する。
 *   - 既に実績が生成されているかの判定もここで行い、生成しない場合はnullを返す。
 *   - ここでは、実績は仮登録状態で生成される。
 *   - このクラスからは、指定日を1時間区切りにして実績の生成を24回呼び出す。
 * - OverlapEventMergeService
 *   - 連続している同じイベントをマージする。
 *   - このクラスからは、ActualBuilderServiceで生成した1時間区切りの実績をマージするために使う。
 * - ActualAutoRegistrarionFinalizer
 *   - 実績生成の後処理として、タイトルの割り当てとDBへの保存を行う。
 *   - このタイミングでタイトルの割り当てを行うのは、以下を回避するため。
 *     - タイトルの割り当て方法が「予定と時間帯が重なる実績は予定と同じタイトルにする」であるため、
 *       予定よりも実績が長くなってしまった場合、予定内の時間帯と予定外の時間帯のタイトルが変わってマージされなくなる。
 *
 * 上記で実績を仮登録状態で自動登録できる。仮登録状態の実績は、このクラスの confirmActualRegistration で本登録したり、
 * deleteProvisional で削除したりすることができる。
 */
@injectable()
export class ActualAutoRegistrationServiceImpl implements IActualAutoRegistrationService {
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService,
    @inject(TYPES.ActualPredictiveCreationService)
    private readonly actualPredictiveCreationService: IActualPredictiveCreationService,
    @inject(TYPES.OverlapEventMergeService)
    private readonly overlapEventMergeService: IOverlapEventMergeService,
    @inject(TYPES.ActualAutoRegistrationFinalizer)
    private readonly actualAutoRegistrationFinalizer: IActualAutoRegistrationFinalizer
  ) {}

  async autoRegisterProvisionalActuals(targetDate: Date): Promise<void> {
    const buildActualPromises = Array.from({ length: 24 }).map((_, hour) => {
      const start = addHours(targetDate, hour);
      const end = addHours(start, 1);
      return this.actualPredictiveCreationService.generatePredictedActual(start, end);
    });

    const actualsBeforeMerge = await Promise.all(buildActualPromises).then((actuals) =>
      actuals.filter((actual): actual is EventEntry => actual != null)
    );

    const mergedActuals = this.overlapEventMergeService.mergeOverlapEvent(actualsBeforeMerge);

    await this.actualAutoRegistrationFinalizer.finalizeRegistration(mergedActuals);
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
    Promise.all(
      provisionalActuals.map((provisionalActual) =>
        this.eventEntryService.save({ ...provisionalActual, isProvisional: false })
      )
    );
  }

  /**
   * 1日分の仮実績を全て削除する
   *
   * @param targetDate
   */
  async deleteProvisionalActuals(targetDate: Date): Promise<void> {
    const provisionalActuals = await this.getProvisionalActuals(targetDate);
    Promise.all(
      provisionalActuals.map((provisionalActual) =>
        this.eventEntryService.delete(provisionalActual.id)
      )
    );
  }
}
