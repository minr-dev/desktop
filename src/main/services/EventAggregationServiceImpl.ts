import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import type { IEventEntrySearchService } from './IEventEntrySearchService';
import { EVENT_TYPE } from '@shared/data/EventEntry';
import { EventAggregationParams, IEventAggregationService } from './IEventAggregationService';
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
    const plans = await this.eventEntrySearchService.getTaskAssociatedEvents({
      eventType: EVENT_TYPE.PLAN,
    });
    const planningTimeData = taskIds.map((taskId): [string, number] => [
      taskId,
      this.aggregateEventTime(plans.filter((plan) => plan.taskId === taskId)),
    ]);
    return new Map<string, number>(planningTimeData);
  }

  async aggregateByProject(params: EventAggregationParams): Promise<Map<string, number>> {
    const { startDate, endDate, eventType } = params;
    const eventEntrySearchs = await this.eventEntrySearchService.getProjectAssociatedEvents({
      start: startDate,
      end: endDate,
      eventType: eventType,
    });
    const names = [
      ...new Set(
        eventEntrySearchs
          .map((event) => event.projectName)
          .filter((projectName): projectName is string => projectName != null)
      ),
    ];
    const eventEntryTimeData = names.map((projectName): [string, number] => [
      projectName,
      this.aggregateEventTime(
        eventEntrySearchs.filter((event) => event.projectName === projectName)
      ),
    ]);
    return new Map<string, number>(eventEntryTimeData);
  }

  async aggregateByCategory(params: EventAggregationParams): Promise<Map<string, number>> {
    const { startDate, endDate, eventType } = params;
    const eventEntrySearchs = await this.eventEntrySearchService.getCategoryAssociatedEvents({
      start: startDate,
      end: endDate,
      eventType: eventType,
    });
    const names = [
      ...new Set(
        eventEntrySearchs
          .map((event) => event.categoryName)
          .filter((categoryName): categoryName is string => categoryName != null)
      ),
    ];
    const eventEntryTimeData = names.map((categoryName): [string, number] => [
      categoryName,
      this.aggregateEventTime(
        eventEntrySearchs.filter((event) => event.categoryName === categoryName)
      ),
    ]);
    return new Map<string, number>(eventEntryTimeData);
  }

  async aggregateByTask(params: EventAggregationParams): Promise<Map<string, number>> {
    const { startDate, endDate, eventType } = params;
    const eventEntrySearchs = await this.eventEntrySearchService.getTaskAssociatedEvents({
      start: startDate,
      end: endDate,
      eventType: eventType,
    });
    const names = [
      ...new Set(
        eventEntrySearchs
          .map((event) => event.taskName)
          .filter((taskName): taskName is string => taskName != null)
      ),
    ];
    const eventEntryTimeData = names.map((taskName): [string, number] => [
      taskName,
      this.aggregateEventTime(eventEntrySearchs.filter((event) => event.taskName === taskName)),
    ]);
    return new Map<string, number>(eventEntryTimeData);
  }

  async aggregateByLabel(params: EventAggregationParams): Promise<Map<string, number>> {
    const { startDate, endDate, eventType } = params;
    const eventEntrySearchs = await this.eventEntrySearchService.getLabelAssociatedEvents({
      start: startDate,
      end: endDate,
      eventType: eventType,
    });
    const ids = [
      ...new Set(
        eventEntrySearchs
          .flatMap((event) => (event.labelNames != null ? event.labelNames : []))
          .map((labelName) => String(labelName))
      ),
    ];
    const eventEntryTimeData = ids.map((labelName): [string, number] => [
      labelName,
      this.aggregateEventTime(
        eventEntrySearchs.filter(
          (event) => event.labelNames && event.labelNames.includes(labelName)
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
