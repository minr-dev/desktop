import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IEventAggregationService } from './IEventAggregationService';
import { OverrunTask } from '@shared/data/OverrunTask';
import { ITaskAllocationService } from './ITaskAllocationService';
import { TimeSlot } from '@shared/data/TimeSlot';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { EventEntryFactory } from './EventEntryFactory';
import type { IUserDetailsService } from './IUserDetailsService';
import { addMilliseconds } from 'date-fns';
import { TaskAllocationResult } from '@shared/data/TaskAllocationResult';
import { Task } from '@shared/data/Task';
import { getLogger } from '@main/utils/LoggerUtil';

const logger = getLogger('TaskAllocationServiceImpl');

interface TaskAllocationInfo {
  id: string;
  name: string;
  projectId: string;
  description: string;
  estimatedTime?: number;
  scheduledTime: number;
  extraAllocationTime?: number;
}

/**
 * 予定の自動登録で使うクラス。
 * 与えられた時間帯とタスクをもとに予定を割り当て、その配列を返す。
 * 実績工数をもとに残りの工数を計算して割り当てするが、予定工数を超過している場合は割り当てせずに超過情報を取得する。
 * 超過タスクがある場合でも割り当ては継続し、割り当て完了までにチェックした超過情報すべてを返す。
 * 逆に、割り当て完了までにチェックされなかった優先度の低いタスクの超過情報は返さない。
 * @see PlanAutoRegistrationServiceImpl
 */
@injectable()
export class TaskAllocationServiceImpl implements ITaskAllocationService {
  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailService: IUserDetailsService,
    @inject(TYPES.EventAggregationService)
    private readonly eventAggregationService: IEventAggregationService
  ) {}

  async allocate(
    timeSlots: TimeSlot<Date>[],
    tasks: Task[],
    taskExtraHours: Map<string, number> = new Map<string, number>()
  ): Promise<TaskAllocationResult> {
    logger.debug('allocate', timeSlots, tasks, taskExtraHours);
    const userId = await this.userDetailService.getUserId();
    const tasksToAllocate = await this.getTaskAllocationInfo(userId, tasks, taskExtraHours);

    let remainingTimeSlots = [...timeSlots];
    const taskAllocations: EventEntry[] = [];
    const overrunTasks: OverrunTask[] = [];
    for (const task of tasksToAllocate) {
      if (remainingTimeSlots.length == 0) {
        break;
      }
      if (
        task.extraAllocationTime == null &&
        task.estimatedTime &&
        task.scheduledTime >= task.estimatedTime
      ) {
        overrunTasks.push({ taskId: task.id, schduledTime: task.scheduledTime });
        continue;
      }

      const requiredTime = this.calculateTimeToAllocate(task);
      const { extractedSlots: timeSlots, remainingSlots } = this.extractTimeSlots(
        remainingTimeSlots,
        requiredTime
      );
      remainingTimeSlots = remainingSlots;
      const provisionalPlans = timeSlots.map((timeSlot) =>
        EventEntryFactory.create({
          userId: userId,
          eventType: EVENT_TYPE.PLAN,
          summary: task.name,
          start: { dateTime: timeSlot.start },
          end: { dateTime: timeSlot.end },
          projectId: task.projectId,
          taskId: task.id,
          description: task.description,
          isProvisional: true,
        })
      );
      taskAllocations.push(...provisionalPlans);
    }

    return { taskAllocations: taskAllocations, overrunTasks: overrunTasks };
  }

  private async getTaskAllocationInfo(
    userId: string,
    tasks: Task[],
    extraAllocations: Map<string, number>
  ): Promise<TaskAllocationInfo[]> {
    const plannedTimeMap = await this.eventAggregationService.getPlannedTimeByTasks(
      userId,
      tasks.map((task) => task.id)
    );
    return tasks.map((task): TaskAllocationInfo => {
      const extraAllocationHours = extraAllocations.get(task.id);
      if (extraAllocationHours != null && extraAllocationHours < 0) {
        throw new Error('extraAllocation must be non-negative.');
      }
      const extraAllocationTime =
        extraAllocationHours != null ? extraAllocationHours * 60 * 60 * 1000 : undefined;
      const estimatedTime = task.plannedHours ? task.plannedHours * 60 * 60 * 1000 : undefined;
      const scheduledTime = plannedTimeMap.get(task.id);
      if (scheduledTime == null) {
        throw new Error('scheduledTime was not found.');
      }
      return {
        id: task.id,
        name: task.name,
        projectId: task.projectId,
        description: task.description,
        estimatedTime,
        scheduledTime,
        extraAllocationTime,
      };
    });
  }

  private calculateTimeToAllocate(task: TaskAllocationInfo): number {
    if (task.extraAllocationTime != null) {
      return task.extraAllocationTime;
    }
    if (!task.estimatedTime) {
      return 0;
    }
    return task.estimatedTime - task.scheduledTime;
  }

  private extractTimeSlots(
    sortedTimeSlots: TimeSlot<Date>[],
    durationMs: number
  ): { extractedSlots: TimeSlot<Date>[]; remainingSlots: TimeSlot<Date>[] } {
    const remainingSlots = [...sortedTimeSlots];
    let remainingTime = durationMs;

    const extractedSlots: TimeSlot<Date>[] = [];
    while (remainingTime > 0 && remainingSlots.length > 0) {
      const timeSlot = remainingSlots.shift();
      if (!timeSlot) {
        break;
      }

      const timeSlotLength = timeSlot.end.getTime() - timeSlot.start.getTime();
      if (remainingTime < timeSlotLength) {
        // 残り時間で現在の timeSlot が埋まらない場合、余った時間の timeSlot を戻す
        const end = addMilliseconds(timeSlot.start, remainingTime);
        extractedSlots.push({ start: timeSlot.start, end: end });
        remainingSlots.unshift({ start: end, end: timeSlot.end });
      } else {
        extractedSlots.push(timeSlot);
      }
      remainingTime -= timeSlotLength;
    }
    return { extractedSlots, remainingSlots };
  }
}
