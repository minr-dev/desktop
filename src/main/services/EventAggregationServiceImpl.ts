import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import type { IEventEntryService } from './IEventEntryService';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { IEventAggregationService } from './IEventAggregationService';

/**
 * イベントの時間の合計を計算するクラス。
 */
@injectable()
export class EventAggregationServiceImpl implements IEventAggregationService {
  constructor(
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService
  ) {}

  async getPlannedTimeByTasks(userId: string, taskIds: string[]): Promise<Map<string, number>> {
    const plans = (await this.eventEntryService.getAllByTasks(userId, taskIds)).filter(
      (event) => event.eventType == EVENT_TYPE.PLAN || event.eventType == EVENT_TYPE.SHARED
    );
    const planningTimeData = taskIds.map((taskId): [string, number] => [
      taskId,
      this.aggregateEventTime(plans.filter((plan) => plan.taskId === taskId)),
    ]);
    return new Map<string, number>(planningTimeData);
  }

  private aggregateEventTime(events: EventEntry[]): number {
    return events
      .map((event) => {
        if (event.start.dateTime == null || event.end.dateTime == null) {
          return 0;
        }
        return event.end.dateTime.getTime() - event.start.dateTime.getTime();
      })
      .reduce((acc, time) => acc + time, 0);
  }
}
