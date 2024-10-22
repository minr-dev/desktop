import type { IEventEntryCsvService } from '@main/services/IEventEntryCsvService';
import { TYPES } from '@main/types';
import { IpcChannel } from '@shared/constants';
import { EventEntryCsvSetting } from '@shared/data/EventEntryCsvSetting';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { IIpcHandlerInitializer } from './IIpcHandlerInitializer';

@injectable()
export class EventEntryCsvServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.EventEntryCsvService)
    private readonly eventEntryCsvService: IEventEntryCsvService
  ) {}

  init(): void {
    ipcMain.handle(
      IpcChannel.EVENT_ENTRY_CSV_OUTPUT,
      async (_event, EventEntryCsvSetting: EventEntryCsvSetting) => {
        return await this.eventEntryCsvService.createCsv(EventEntryCsvSetting);
      }
    );
  }
}
