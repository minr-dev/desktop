import { TYPES } from '@main/types';
import { WindowLog, SYSTEM_IDLE_BASENAME, SYSTEM_IDLE_PID } from '@shared/dto/WindowLog';
import { inject, injectable } from 'inversify';
import type { IWindowLogService } from './IWindowLogService';
import path from 'path';
import type { IActivityService } from './IActivityService';
import { ActivityEvent } from '@shared/dto/ActivityEvent';
import { add as addDate } from 'date-fns';
import type { ISystemIdleService } from './ISystemIdleService';
import { windowManager } from 'node-window-manager';

@injectable()
export class WindowWatcher {
  private currWinlog: WindowLog | null = null;
  private currActivity: ActivityEvent | null = null;
  private winTimer: NodeJS.Timer | null = null;
  private saveTimer: NodeJS.Timer | null = null;

  constructor(
    @inject(TYPES.WindowLogService)
    private readonly activeWindowLogService: IWindowLogService,
    @inject(TYPES.SystemIdleService)
    private readonly systemIdleService: ISystemIdleService,
    @inject(TYPES.ActivityService)
    private readonly activityService: IActivityService
  ) {}

  watch(callback: (events: ActivityEvent[]) => void): void {
    const now = new Date();
    const start = addDate(now, { days: -1 });
    this.activityService.getLastActivity(start, now).then((activity) => {
      this.currActivity = activity ? activity : null;
    });
    if (!this.winTimer) {
      this.winTimer = setInterval(() => {
        this.handle(callback);
      }, 60 * 1000);
    }
    if (!this.saveTimer) {
      this.saveTimer = setInterval(() => {
        this.save();
      }, 600 * 1000);
    }
  }

  stop(): void {
    if (this.currWinlog) {
      this.currWinlog.deactivated = new Date();
      this.save();
    }
    if (this.winTimer) {
      clearInterval(this.winTimer);
      this.winTimer = null;
    }
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
  }

  private async handle(callback: (updateEvents: ActivityEvent[]) => void): Promise<void> {
    const state = this.systemIdleService.get();
    let pid: string;
    let basename: string;
    let windowTitle: string;
    let cmdPath: string | null = null;
    if (state !== 'active') {
      pid = SYSTEM_IDLE_PID;
      basename = SYSTEM_IDLE_BASENAME;
      windowTitle = state;
    } else {
      const winobj = windowManager.getActiveWindow();
      // title: '● main.ts - depot - Visual Studio Code'
      // pid: '5852'
      pid = `${winobj.id}`;
      basename = path.basename(winobj.path);
      windowTitle = winobj.getTitle();
      cmdPath = winobj.path;
    }
    if (this.currWinlog) {
      this.currWinlog.deactivated = new Date();
      if (this.currWinlog.basename !== basename || this.currWinlog.pid !== pid) {
        await this.activeWindowLogService.save(this.currWinlog);
        this.currWinlog = null;
      }
    }
    if (!this.currWinlog) {
      this.currWinlog = await this.activeWindowLogService.create(
        basename,
        pid,
        windowTitle,
        cmdPath
      );
      this.currWinlog = await this.activeWindowLogService.save(this.currWinlog);

      const updateEvents: ActivityEvent[] = [];
      if (this.currActivity) {
        updateEvents.push(this.currActivity);
        if (!this.activityService.updateActivityEvent(this.currActivity, this.currWinlog)) {
          this.currActivity = null;
        }
      }
      if (!this.currActivity) {
        this.currActivity = await this.activityService.createActivityEvent(this.currWinlog);
        updateEvents.push(this.currActivity);
      }
      callback(updateEvents);
    }
  }

  private async save(): Promise<void> {
    if (!this.currWinlog) {
      return;
    }
    await this.activeWindowLogService.save(this.currWinlog);
  }
}