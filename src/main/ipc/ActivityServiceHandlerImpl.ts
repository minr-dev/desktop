import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import type { IActivityService } from '@main/services/IActivityService';

@injectable()
export class ActivityServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.ActivityService)
    private readonly activityService: IActivityService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.ACTIVITY_EVENT_LIST, async (_event, start, end) => {
      return await this.activityService.fetchActivities(start, end);
    });
  }
}
