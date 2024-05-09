import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { IActivityUsageService } from '@main/services/IActivityUsageService';

@injectable()
export class ActivityUsageServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.ActivityUsageService)
    private readonly activityUsageService: IActivityUsageService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.ACTIVITY_USAGE_LIST, async (_event, start, end) => {
      return await this.activityUsageService.get(start, end);
    });
  }
}
