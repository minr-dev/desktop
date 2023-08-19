import { Timer, TimerManager } from '@shared/utils/TimerManager';
import { injectable } from 'inversify';

@injectable()
export class MockTimerManager extends TimerManager {
  create(name: string): Timer {
    if (this.timers[name]) {
      throw new Error(`Timer ${name} already exists.`);
    }
    const timer = new MockTimer();
    this.timers[name] = timer;
    return timer;
  }
}

export class MockTimer extends Timer {
  private timeoutCallParams: { callback: () => void; ms?: number }[] = [];

  addTimeout(callback: () => void, ms?: number): void {
    // callback を無害なダミー関数に置き換えるモック
    super.addTimeout(() => {}, ms);
    this.timeoutCallParams.push({ callback, ms });
  }

  getTimeoutCallParams(): { callback: () => void; ms?: number }[] {
    return this.timeoutCallParams;
  }
}
