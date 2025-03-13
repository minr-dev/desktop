import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { handleDatabaseOperation } from './dbHandlerUtil';
import type { IEventAnalysisAggregationService } from '@main/services/IEventAnalysisAggregationService';
import { EventAggregationTime } from '@shared/data/EventAggregationTime';

@injectable()
export class EventAnalysisAggregationServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.EventAnalysisAggregationService)
    private readonly eventAnalysisAggregationService: IEventAnalysisAggregationService
  ) {}

  init(): void {
    ipcMain.handle(
      IpcChannel.EVENT_ANALYSIS_AGGREGATION_LABEL,
      async (_event, start, end, eventType) => {
        return handleDatabaseOperation(async (): Promise<EventAggregationTime[]> => {
          return await this.eventAnalysisAggregationService.aggregateLabel(start, end, eventType);
        });
      }
    );
  }
}
