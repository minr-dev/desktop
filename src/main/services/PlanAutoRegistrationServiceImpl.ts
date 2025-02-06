import { PlanAutoRegistrationResult } from '@shared/data/PlanAutoRegistrationResult';
import { IPlanAutoRegistrationService } from './IPlanAutoRegistrationService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IUserDetailsService } from './IUserDetailsService';
import type { IEventEntryService } from './IEventEntryService';
import { EventEntry, EVENT_TYPE } from '@shared/data/EventEntry';
import { addDays } from 'date-fns';
import type { ITaskAllocationService } from './ITaskAllocationService';
import type { IPlanAvailableTimeSlotService } from './IPlanAvailableTimeSlotService';
import type { ITaskProviderService } from './ITaskProviderService';
import { getLogger } from '@main/utils/LoggerUtil';

const logger = getLogger('PlanAutoRegistrationServiceImpl');

/**
 * 予定の自動登録を行うサービスクラス
 *
 * - PlanAvailableTimeSlotService
 *   - 予定の空き時間を計算するサービスクラス。これで取得した空き時間に仮の予定を作成する。
 * - TaskProviderService
 *   - 割り当てるタスクを優先度順に取得するサービスクラス。
 * - TaskAllocationService
 *   - TaskProviderServiceから受け取ったタスクをもとに、予定を作成する。
 *   - タスクの実績工数が予定工数を上回っている場合は、その情報を返却し、予定の作成は取りやめる。
 *
 * 実際の流れ
 * 1. PlanAvailableTimeSlotService から空き時間を取得
 * 2. TaskProviderService で割り当てるタスクを取得
 * 3. TaskAllocationService で予定を作成または超過情報を返却
 * 4-a. 予定が作成された場合はそれを仮登録状態で保存し、success: true で終了
 * 4-b. 超過情報が返却された場合は予定の登録は行わず、success: false とともに超過情報を返して終了
 *
 * 超過情報が返った後はrenderer側で超過しているタスクに追加で割り当てる工数を入力し、taskExtraHours にいれて再び呼び出す。
 * taskExtraHours に工数が入っているタスクはそこから優先的に割り当て工数が決められ、超過情報のチェックは行われない。
 *
 * 上記で予定を仮登録状態で自動登録できる。仮登録状態の実績は、このクラスの confirmActualRegistration で本登録したり、
 * deleteProvisional で削除したりすることができる。
 */
@injectable()
export class PlanAutoRegistrationServiceImpl implements IPlanAutoRegistrationService {
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService,
    @inject(TYPES.PlanAvailableTimeSlotService)
    private readonly planAvailableTimeSlotService: IPlanAvailableTimeSlotService,
    @inject(TYPES.TaskProviderService)
    private readonly taskProviderService: ITaskProviderService,
    @inject(TYPES.TaskAllocationService)
    private readonly taskAllocationService: ITaskAllocationService
  ) {}

  async autoRegisterProvisional(
    targetDate: Date,
    taskExtraHours: Map<string, number> = new Map<string, number>()
  ): Promise<PlanAutoRegistrationResult> {
    const freeSlots = await this.planAvailableTimeSlotService.calculateAvailableTimeSlot(
      targetDate
    );
    const tasks = await this.taskProviderService.getTasksForAllocation(targetDate);
    const taskAllocationResult = await this.taskAllocationService.allocate(
      freeSlots,
      tasks,
      taskExtraHours
    );
    if (logger.isDebugEnabled()) logger.debug('taskAllocationResult', taskAllocationResult);
    if (taskAllocationResult.overrunTasks.length > 0) {
      return { success: false, overrunTasks: taskAllocationResult.overrunTasks };
    }
    this.eventEntryService.bulkUpsert(taskAllocationResult.taskAllocations);
    return { success: true };
  }

  private async getProvisionalPlans(targetDate: Date): Promise<EventEntry[]> {
    const userId = await this.userDetailsService.getUserId();
    const start = targetDate;
    const end = addDays(start, 1);
    const eventEntries = await this.eventEntryService.list(userId, start, end, EVENT_TYPE.PLAN);
    return eventEntries.filter((event) => event.isProvisional);
  }

  /**
   * 1日分の仮予定を全て本登録状態にする
   *
   * @param targetDate
   */
  async confirmRegistration(targetDate: Date): Promise<void> {
    const provisionalPlans = await this.getProvisionalPlans(targetDate);
    this.eventEntryService.bulkUpsert(
      provisionalPlans.map((provisionalActual) => ({ ...provisionalActual, isProvisional: false }))
    );
  }

  /**
   * 1日分の仮予定を全て削除する
   *
   * @param targetDate
   */
  async deleteProvisional(targetDate: Date): Promise<void> {
    const provisionalPlans = await this.getProvisionalPlans(targetDate);
    this.eventEntryService.bulkLogicalDelete(provisionalPlans.map((plan) => plan.id));
  }
}
