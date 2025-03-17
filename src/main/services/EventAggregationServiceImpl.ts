import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import type { IEventEntryService } from './IEventEntryService';
import type { IEventEntrySearchService } from './IEventEntrySearchService';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { IEventAggregationService } from './IEventAggregationService';

/**
 * イベントの時間の合計を計算するクラス。
 */
@injectable()
export class EventAggregationServiceImpl implements IEventAggregationService {
  constructor(
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService,
    @inject(TYPES.EventEntrySearchService)
    private readonly eventEntrySearchService: IEventEntrySearchService
  ) {}

  async aggregatePlannedTimeByTasks(
    userId: string,
    taskIds: string[]
  ): Promise<Map<string, number>> {
    const plans = (await this.eventEntryService.getAllByTasks(userId, taskIds))
      .filter((event) => event.eventType == EVENT_TYPE.PLAN || event.eventType == EVENT_TYPE.SHARED)
      .filter((event) => !event.deleted);
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
  ): Promise<EventAggregationTime[]> {
    const eventEntrySearchs = await this.eventEntrySearchService.getProjectAssociatedEvents(
      startDate,
      endDate,
      eventType
    );
    const eventDataArray = new Map<string, EventAggregationTime>();
    for (const event of eventEntrySearchs) {
      if (!event.start.dateTime || !event.end.dateTime || !event.projectName) continue;
      const start = event.start.dateTime > startDate ? event.start.dateTime : startDate;
      const end = event.end.dateTime < endDate ? event.end.dateTime : endDate;
      const aggregationTime = end.getTime() - start.getTime();
      const analysisData = eventDataArray.get(event.projectName);
      if (!analysisData) {
        eventDataArray.set(event.projectName, {
          name: event.projectName,
          aggregationTime: aggregationTime,
        });
      } else {
        analysisData.aggregationTime += aggregationTime;
      }
    }
    return Array.from(eventDataArray.values()).sort((e1, e2) => {
      return e2.aggregationTime - e1.aggregationTime;
    });
  }

  async aggregateByCategory(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]> {
    const eventEntrySearchs = await this.eventEntrySearchService.getCategoryAssociatedEvents(
      startDate,
      endDate,
      eventType
    );
    const eventDataArray = new Map<string, EventAggregationTime>();
    for (const event of eventEntrySearchs) {
      if (!event.start.dateTime || !event.end.dateTime || !event.categoryName) continue;
      const start = event.start.dateTime > startDate ? event.start.dateTime : startDate;
      const end = event.end.dateTime < endDate ? event.end.dateTime : endDate;
      const aggregationTime = end.getTime() - start.getTime();
      const analysisData = eventDataArray.get(event.categoryName);
      if (!analysisData) {
        eventDataArray.set(event.categoryName, {
          name: event.categoryName,
          aggregationTime: aggregationTime,
        });
      } else {
        analysisData.aggregationTime += aggregationTime;
      }
    }
    return Array.from(eventDataArray.values()).sort((e1, e2) => {
      return e2.aggregationTime - e1.aggregationTime;
    });
  }

  async aggregateByTask(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]> {
    const eventEntrySearchs = await this.eventEntrySearchService.getTaskAssociatedEvents(
      startDate,
      endDate,
      eventType
    );
    const eventDataArray = new Map<string, EventAggregationTime>();
    for (const event of eventEntrySearchs) {
      if (!event.start.dateTime || !event.end.dateTime || !event.taskName) continue;
      const start = event.start.dateTime > startDate ? event.start.dateTime : startDate;
      const end = event.end.dateTime < endDate ? event.end.dateTime : endDate;
      const aggregationTime = end.getTime() - start.getTime();
      const analysisData = eventDataArray.get(event.taskName);
      if (!analysisData) {
        eventDataArray.set(event.taskName, {
          name: event.taskName,
          aggregationTime: aggregationTime,
        });
      } else {
        analysisData.aggregationTime += aggregationTime;
      }
    }
    return Array.from(eventDataArray.values()).sort((e1, e2) => {
      return e2.aggregationTime - e1.aggregationTime;
    });
  }

  async aggregateByLabel(
    startDate: Date,
    endDate: Date,
    eventType: EVENT_TYPE
  ): Promise<EventAggregationTime[]> {
    const eventEntrySearchs = await this.eventEntrySearchService.getLabelAssociatedEvents(
      startDate,
      endDate,
      eventType
    );
    const eventDataArray = new Map<string, EventAggregationTime>();
    for (const event of eventEntrySearchs) {
      if (!event.start.dateTime || !event.end.dateTime || !event.labelNames) continue;
      const start = event.start.dateTime > startDate ? event.start.dateTime : startDate;
      const end = event.end.dateTime < endDate ? event.end.dateTime : endDate;
      const aggregationTime = end.getTime() - start.getTime();
      for (const labelData of event.labelNames) {
        const analysisData = eventDataArray.get(labelData);
        if (!analysisData) {
          eventDataArray.set(labelData, {
            name: labelData,
            aggregationTime: aggregationTime,
          });
        } else {
          analysisData.aggregationTime += aggregationTime;
        }
      }
    }
    return Array.from(eventDataArray.values()).sort((e1, e2) => {
      return e2.aggregationTime - e1.aggregationTime;
    });
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
