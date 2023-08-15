import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import type { ISyncProcessor } from './ISyncProcessor';

@injectable()
export class SyncScheduler {
  private timer: NodeJS.Timer | null = null;

  constructor(
    @inject(TYPES.CalendarSynchronizer)
    private readonly syncProcessor: ISyncProcessor
  ) {}

  start(): void {
    if (!this.timer) {
      this.timer = setInterval(() => {
        this.syncProcessor.sync();
      }, 5 * 60 * 1000);
      this.syncProcessor.sync();
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
