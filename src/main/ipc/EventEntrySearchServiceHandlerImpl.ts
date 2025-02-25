import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { IEventEntrySearchService } from '@main/services/IEventEntrySearchService';
import { handleDatabaseOperation } from './dbHandlerUtil';
import { EventEntrySearch } from '@main/dto/EventEntrySearch';

@injectable()
export class EventEntrySearchServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.EventEntrySearchService)
    private readonly eventEntrySearchService: IEventEntrySearchService
  ) {}

  init(): void {
    ipcMain.handle(
      IpcChannel.SEARCH_BUSINESS_CLASSIFICATION,
      async (_event, start, end, eventType) => {
        return handleDatabaseOperation(async (): Promise<EventEntrySearch[]> => {
          return await this.eventEntrySearchService.searchBusinessClassification(
            start,
            end,
            eventType
          );
        });
      }
    );
  }
}
