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
    ipcMain.handle(IpcChannel.EVENT_AGGREGATION_PROJECT, async (_event, start, end, eventType) => {
      return handleDatabaseOperation(async (): Promise<EventAggregationTime[]> => {
        const eventAggregateMap = await this.eventAggregationService.aggregateByProject(
          start,
          end,
          eventType
        );
        return this.getEventAggregationTimeList(eventAggregateMap);
      });
    });

    ipcMain.handle(IpcChannel.EVENT_AGGREGATION_CATEGORY, async (_event, start, end, eventType) => {
      return handleDatabaseOperation(async (): Promise<EventAggregationTime[]> => {
        const eventAggregateMap = await this.eventAggregationService.aggregateByCategory(
          start,
          end,
          eventType
        );
        return this.getEventAggregationTimeList(eventAggregateMap);
      });
    });

    ipcMain.handle(IpcChannel.EVENT_AGGREGATION_TASK, async (_event, start, end, eventType) => {
      return handleDatabaseOperation(async (): Promise<EventAggregationTime[]> => {
        const eventAggregateMap = await this.eventAggregationService.aggregateByTask(
          start,
          end,
          eventType
        );
        return this.getEventAggregationTimeList(eventAggregateMap);
      });
    });

    ipcMain.handle(IpcChannel.EVENT_AGGREGATION_LABEL, async (_event, start, end, eventType) => {
      return handleDatabaseOperation(async (): Promise<EventAggregationTime[]> => {
        const eventAggregateMap = await this.eventAggregationService.aggregateByLabel(
          start,
          end,
          eventType
        );
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
