import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { handleDatabaseOperation } from './dbHandlerUtil';
import type { IEventAggregationService } from '@main/services/IEventAggregationService';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';

@injectable()
export class EventAggregationServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.EventAggregationService)
    private readonly eventAggregationService: IEventAggregationService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.EVENT_AGGREGATION_PROJECT, async (_event, params) => {
      return handleDatabaseOperation(async (): Promise<EventAggregationTime[]> => {
        const { start, end, eventType } = params;
        const eventAggregateMap = await this.eventAggregationService.aggregateByProject({
          startDate: start,
          endDate: end,
          eventType: eventType,
        });
        return this.getEventAggregationTimeList(eventAggregateMap);
      });
    });

    ipcMain.handle(IpcChannel.EVENT_AGGREGATION_CATEGORY, async (_event, params) => {
      return handleDatabaseOperation(async (): Promise<EventAggregationTime[]> => {
        const { start, end, eventType } = params;
        const eventAggregateMap = await this.eventAggregationService.aggregateByCategory({
          startDate: start,
          endDate: end,
          eventType: eventType,
        });
        return this.getEventAggregationTimeList(eventAggregateMap);
      });
    });

    ipcMain.handle(IpcChannel.EVENT_AGGREGATION_TASK, async (_event, params) => {
      return handleDatabaseOperation(async (): Promise<EventAggregationTime[]> => {
        const { start, end, eventType } = params;
        const eventAggregateMap = await this.eventAggregationService.aggregateByTask({
          startDate: start,
          endDate: end,
          eventType: eventType,
        });
        return this.getEventAggregationTimeList(eventAggregateMap);
      });
    });

    ipcMain.handle(IpcChannel.EVENT_AGGREGATION_LABEL, async (_event, params) => {
      return handleDatabaseOperation(async (): Promise<EventAggregationTime[]> => {
        const { start, end, eventType } = params;
        const eventAggregateMap = await this.eventAggregationService.aggregateByLabel({
          startDate: start,
          endDate: end,
          eventType: eventType,
        });
        return this.getEventAggregationTimeList(eventAggregateMap);
      });
    });
  }

  private getEventAggregationTimeList(aggregateData: Map<string, number>): EventAggregationTime[] {
    return Array.from(aggregateData, ([name, aggregationTime]) => ({ name, aggregationTime })).sort(
      (e1, e2) => {
        return e2.aggregationTime - e1.aggregationTime;
      }
    );
  }
}
