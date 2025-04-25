import { Task } from '@shared/data/Task';
import { inject, injectable } from 'inversify';
import { ITaskProviderService } from './ITaskProviderService';
import { TYPES } from '@main/types';
import type { IEventEntryService } from './IEventEntryService';
import type { ITaskService } from './ITaskService';
import type { IUserDetailsService } from './IUserDetailsService';
import { addDays } from 'date-fns';
import { EVENT_TYPE } from '@shared/data/EventEntry';

/**
 * 予定の自動登録で使うクラス。
 * 自動登録で割り当てるタスクを優先順位をつけて返す。
 * タスクは未完了のものの中から、優先度の高い順に返される。
 * 優先度が同じタスクに関しては、期限日の早い順に並べられ、
 * 期限日のないタスクは同じ優先度内で最後に並べられる。
 * @see PlanAutoRegistrationServiceImpl
 */
@injectable()
export class TaskProviderServiceImpl implements ITaskProviderService {
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService,
    @inject(TYPES.TaskService)
    private readonly taskService: ITaskService
  ) {}

  async getTasksForAllocation(targetDate: Date, projectId?: string): Promise<Task[]> {
    const userId = await this.userDetailsService.getUserId();
    const start = targetDate;
    const end = addDays(targetDate, 1);
    const plans = (await this.eventEntryService.list(userId, start, end))
      .filter((event) => event.eventType == EVENT_TYPE.PLAN || event.eventType == EVENT_TYPE.SHARED)
      .filter((event) => !event.deleted);
    const schduledTaskIds = plans
      .map((plan) => plan.taskId)
      .filter((taskId): taskId is string => taskId != null);
    const tasks = await this.taskService.getUncompletedByPriority();
    return tasks
      .filter((task) => !schduledTaskIds.includes(task.id))
      .filter((task) => (projectId ? task.projectId == projectId : true));
  }
}
