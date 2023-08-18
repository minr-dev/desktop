import { injectable } from 'inversify';
import { ITaskProcessor } from './ITaskProcessor';

@injectable()
export class TaskScheduler {
  private timer: NodeJS.Timer | null = null;
  private processors: Array<{ processor: ITaskProcessor; interval: number; lastRun: number }> = [];

  addTaskProcessor(processor: ITaskProcessor, interval: number): void {
    this.processors.push({ processor, interval, lastRun: 0 });
  }

  start(): void {
    if (!this.timer) {
      this.timer = setInterval(async () => {
        const now = Date.now();
        for (const task of this.processors) {
          if (now - task.lastRun >= task.interval) {
            await task.processor.execute();
            task.lastRun = now;
          }
        }
      }, 1 * 60 * 1000);
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
