import { TYPES } from '@main/types';
import { ActiveWindowLog } from '@shared/dto/ActiveWindowLog';
import { inject, injectable } from 'inversify';
import type { IActiveWindowLogService } from './IActiveWindowLogService';
import path from 'path';

const { windowManager } = require('node-window-manager');

@injectable()
export class ActiveWindowWatcher {
  private currentLog: ActiveWindowLog | null = null;
  private winTimer: NodeJS.Timer | null = null;
  private saveTimer: NodeJS.Timer | null = null;

  constructor(
    @inject(TYPES.ActiveWindowLogService)
    private readonly activeWindowLogService: IActiveWindowLogService
  ) {}

  watch(): void {
    if (!this.winTimer) {
      this.winTimer = setInterval(() => {
        this.handle();
      }, 60 * 1000);
    }
    if (!this.saveTimer) {
      this.saveTimer = setInterval(() => {
        this.save();
      }, 600 * 1000);
    }
  }

  stop(): void {
    if (this.currentLog) {
      this.currentLog.deactivated = new Date();
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

  private async handle(): Promise<void> {
    const winobj = windowManager.getActiveWindow();
    // title: '● main.ts - depot - Visual Studio Code'
    // pid: '5852'
    const pid = `${winobj.id}`;
    const basename = path.basename(winobj.path);
    if (this.currentLog) {
      this.currentLog.deactivated = new Date();
      if (this.currentLog.basename !== basename || this.currentLog.pid !== pid) {
        await this.activeWindowLogService.save(this.currentLog);
        this.currentLog = null;
      }
    }
    if (!this.currentLog) {
      this.currentLog = await this.activeWindowLogService.create(
        basename,
        pid,
        winobj.getTitle(),
        winobj.path
      );
      this.currentLog = await this.activeWindowLogService.save(this.currentLog);
    }
  }

  private async save(): Promise<void> {
    if (!this.currentLog) {
      return;
    }
    await this.activeWindowLogService.save(this.currentLog);
  }
}
