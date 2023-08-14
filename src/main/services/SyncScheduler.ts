import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import type { ISyncProcessor } from './ISyncProcessor';

@injectable()
export class SyncScheduler {
  private timer: NodeJS.Timer | null = null;

  constructor(
    @inject(TYPES.SyncProcessor)
    private readonly syncProcessor: ISyncProcessor
  ) {}

  start(): void {
    if (!this.timer) {
      this.timer = setInterval(() => {
        this.syncProcessor.sync();
      }, 60 * 1000);
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
