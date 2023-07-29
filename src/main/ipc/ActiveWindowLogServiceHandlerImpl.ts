import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';
import type { IActiveWindowLogService } from '@main/services/IActiveWindowLogService';

@injectable()
export class ActiveWindowLogServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.ActiveWindowLogService)
    private readonly activeWindowLogService: IActiveWindowLogService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.ACTIVE_WINDOW_LOG_LIST, async (_event, start, end) => {
      return await this.activeWindowLogService.list(start, end);
    });

    ipcMain.handle(IpcChannel.ACTIVE_WINDOW_LOG_GET, async (_event, id) => {
      const scheduleEvent = await this.activeWindowLogService.get(id);
      return scheduleEvent;
    });

    ipcMain.handle(
      IpcChannel.ACTIVE_WINDOW_LOG_CREATE,
      async (_event, basename, pid, title, path) => {
        return await this.activeWindowLogService.create(basename, pid, title, path);
      }
    );

    ipcMain.handle(IpcChannel.ACTIVE_WINDOW_LOG_SAVE, async (_event, scheduleEvent) => {
      return await this.activeWindowLogService.save(scheduleEvent);
    });

    ipcMain.handle(IpcChannel.ACTIVE_WINDOW_LOG_DELETE, async (_event, id) => {
      return await this.activeWindowLogService.delete(id);
    });
  }
}
