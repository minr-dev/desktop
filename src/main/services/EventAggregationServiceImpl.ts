import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import type { IEventEntrySearchService } from './IEventEntrySearchService';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { IEventAggregationService } from './IEventAggregationService';
import { EventEntrySearch } from '@main/dto/EventEntrySearch';

/**
 * イベントの時間の合計を計算するクラス。
 */
@injectable()
export class EventAggregationServiceImpl implements IEventAggregationService {
  constructor(
    @inject(TYPES.EventEntrySearchService)
    private readonly eventEntrySearchService: IEventEntrySearchService
  ) {}

  async aggregatePlannedTimeByTasks(taskIds: string[]): Promise<Map<string, number>> {
    const plans = await this.eventEntrySearchService.getTaskAssociatedEvents(
      undefined,
      undefined,
      EVENT_TYPE.PLAN
    );
    const planningTimeData = taskIds.map((taskId): [string, number] => [
      taskId,
      this.aggregateEventTime(plans.filter((plan) => plan.taskId === taskId)),
    ]);
    return new Map<string, number>(planningTimeData);
  }

  async aggregateByProject(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<Map<string, number>> {
    const eventEntrySearchs = await this.eventEntrySearchService.getProjectAssociatedEvents(
      startDate,
      endDate,
      eventType
    );
    const ids = [...new Set(eventEntrySearchs.flatMap((event) => event.projectId))];
    const eventEntryTimeData = ids.map((projectId): [string, number] => [
      projectId || 'undefined',
      this.aggregateEventTime(eventEntrySearchs.filter((plan) => plan.projectId === projectId)),
    ]);
    return new Map<string, number>(eventEntryTimeData);
  }

  async aggregateByCategory(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<Map<string, number>> {
    const eventEntrySearchs = await this.eventEntrySearchService.getCategoryAssociatedEvents(
      startDate,
      endDate,
      eventType
    );
    const ids = [...new Set(eventEntrySearchs.flatMap((event) => event.categoryId))];
    const eventEntryTimeData = ids.map((categoryId): [string, number] => [
      categoryId || 'undefined',
      this.aggregateEventTime(eventEntrySearchs.filter((plan) => plan.categoryId === categoryId)),
    ]);
    return new Map<string, number>(eventEntryTimeData);
  }

  async aggregateByTask(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<Map<string, number>> {
    const eventEntrySearchs = await this.eventEntrySearchService.getTaskAssociatedEvents(
      startDate,
      endDate,
      eventType
    );
    const ids = [...new Set(eventEntrySearchs.flatMap((event) => event.taskId))];
    const eventEntryTimeData = ids.map((taskId): [string, number] => [
      taskId || 'undefined',
      this.aggregateEventTime(eventEntrySearchs.filter((plan) => plan.taskId === taskId)),
    ]);
    return new Map<string, number>(eventEntryTimeData);
  }

  async aggregateByLabel(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<Map<string, number>> {
    const eventEntrySearchs = await this.eventEntrySearchService.getTaskAssociatedEvents(
      startDate,
      endDate,
      eventType
    );
    const ids = [...new Set(eventEntrySearchs.flatMap((event) => event.labelIds))];
    const eventEntryTimeData = ids.map((labelId): [string, number] => [
      labelId || 'undefined',
      this.aggregateEventTime(
        eventEntrySearchs.filter(
          (plan) => plan.labelIds && labelId && !plan.labelIds.includes(labelId)
        )
      ),
    ]);
    return new Map<string, number>(eventEntryTimeData);
  }

  private aggregateEventTime(events: EventEntrySearch[]): number {
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
