import { injectable } from 'inversify';

/**
 * タイマーを管理する
 *
 * インスタンス変数でタイマーを管理しているので、シングルトンにする。
 */
@injectable()
export class TimerManager {
  protected timers: Record<string, Timer> = {};

  create(name: string): Timer {
    if (this.timers[name]) {
      throw new Error(`Timer ${name} already exists.`);
    }
    const timer = new Timer();
    this.timers[name] = timer;
    return timer;
  }

  get(name: string): Timer {
    let timer = this.timers[name];
    if (!timer) {
      timer = this.create(name);
    }
    return timer;
  }

  clear(name: string): void {
    const timer = this.timers[name];
    if (timer) {
      timer.clear();
      delete this.timers[name];
    }
  }
}

export class Timer {
  protected timeouts: NodeJS.Timeout[] = [];

  addTimeout(callback: () => void, ms?: number): void {
    const timeout = setTimeout(callback, ms);
    this.timeouts.push(timeout);
  }

  clear(): void {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts = [];
  }
}
