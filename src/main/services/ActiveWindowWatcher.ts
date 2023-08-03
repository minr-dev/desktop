import { TYPES } from '@main/types';
import { ActiveWindowLog } from '@shared/dto/ActiveWindowLog';
import { inject, injectable } from 'inversify';
import type { IActiveWindowLogService } from './IActiveWindowLogService';
import path from 'path';
import type { IActivityService } from './IActivityService';
import { ActivityEvent } from '@shared/dto/ActivityEvent';
import { add as addDate } from 'date-fns';

const { windowManager } = require('node-window-manager');

@injectable()
export class ActiveWindowWatcher {
  private currWinlog: ActiveWindowLog | null = null;
  private currActivity: ActivityEvent | null = null;
  private winTimer: NodeJS.Timer | null = null;
  private saveTimer: NodeJS.Timer | null = null;

  constructor(
    @inject(TYPES.ActiveWindowLogService)
    private readonly activeWindowLogService: IActiveWindowLogService,
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
    const winobj = windowManager.getActiveWindow();
    // title: '● main.ts - depot - Visual Studio Code'
    // pid: '5852'
    const pid = `${winobj.id}`;
    const basename = path.basename(winobj.path);
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
        winobj.getTitle(),
        winobj.path
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
        this.currActivity = this.activityService.createActivityEvent(this.currWinlog);
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
