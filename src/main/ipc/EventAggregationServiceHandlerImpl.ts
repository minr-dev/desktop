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
    ipcMain.handle(
      IpcChannel.EVENT_ANALYSIS_AGGREGATION_LABEL,
      async (_event, start, end, eventType) => {
        return handleDatabaseOperation(async (): Promise<EventAggregationTime[]> => {
          return await this.eventAggregationService.aggregateByLabel(start, end, eventType);
        });
      }
    );
  }
}
