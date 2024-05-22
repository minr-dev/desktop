import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import { IpcService } from './IpcService';
import { IpcChannel } from '@shared/constants';
import { DateUtil } from '@shared/utils/DateUtil';
import { TimerManager } from '@shared/utils/TimerManager';
import type { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import type { IUserDetailsService } from './IUserDetailsService';
import { PomodoroTimerDetails, TimerState, TimerType } from '@shared/data/PomodoroTimerDetails';

@injectable()
export class PomodoroTimer {
  static readonly TIMER_NAME = 'pomodoroTimer';

  constructor(
    @inject(TYPES.IpcService)
    private readonly ipcService: IpcService,
    @inject(TYPES.DateUtil)
    private readonly dateUtil: DateUtil,
    @inject(TYPES.TimerManager)
    private readonly timerManager: TimerManager,
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.UserPreferenceStoreService)
    private readonly userPreferenceStoreService: IUserPreferenceStoreService
  ) {}

  private details: PomodoroTimerDetails = {
    type: TimerType.WORK,
    state: TimerState.STOPPED,
    currentTime: 0,
  };

  // 一時停止時に、1秒未満の残り時間の情報を保持するために使用
  private lastUpdated: Date | null = null;

  private async getUserId(): Promise<string> {
    const userDetails = await this.userDetailsService.get();
    return userDetails.userId;
  }

  private async getInitialMs(timerType: TimerType): Promise<number | null> {
    const userPreference = await this.userPreferenceStoreService.getOrCreate(
      await this.getUserId()
    );
    if (!userPreference) {
      return null;
    }
    switch (timerType) {
      case TimerType.WORK:
        return userPreference.workingMinutes * 60 * 1000;
      case TimerType.BREAK:
        return userPreference.breakMinutes * 60 * 1000;
    }
  }

  /**
   * 現在のタイマーが停止した後のTimerTypeを返す。
   */
  private async getNextTimerType(): Promise<TimerType> {
    switch (this.details.type) {
      case TimerType.WORK:
        return TimerType.BREAK;
      case TimerType.BREAK:
        return TimerType.WORK;
    }
  }

  async getCurrentDetails(): Promise<PomodoroTimerDetails> {
    return this.details;
  }

  private async updateTime(ms: number): Promise<void> {
    this.details.currentTime -= ms;
    this.lastUpdated = this.dateUtil.getCurrentDate();

    this.notifyDetails();

    // 残り時間が0秒になったときの処理
    if (this.details.currentTime <= 0) {
      const timerType = await this.getNextTimerType();
      await this.set(timerType);
      await this.start();
      return;
    }

    // 次の時間の更新をセットする
    const timer = this.timerManager.get(PomodoroTimer.TIMER_NAME);
    timer.clear();
    // 残り時間が整数秒でないときに、次の通知が整数秒で送られるように調整
    const intervalMs = this.details.currentTime % 1000 || 1000;
    timer.addTimeout(() => {
      this.updateTime(intervalMs);
    }, intervalMs);
  }

  private async set(timerType: TimerType): Promise<void> {
    const initialMs = await this.getInitialMs(timerType);
    if (initialMs == null) {
      return;
    }
    this.details = {
      type: timerType,
      state: TimerState.STOPPED,
      currentTime: initialMs,
    };
  }

  async start(): Promise<void> {
    if (this.details.state == TimerState.RUNNING) {
      return;
    }

    // 時間が設定されていない場合に設定する
    if (this.details.currentTime == 0) {
      const initialMs = await this.getInitialMs(this.details.type);
      if (initialMs == null) {
        return;
      }
      this.details.currentTime = initialMs;
    }

    this.details.state = TimerState.RUNNING;

    this.notifyDetails(true);

    await this.updateTime(1000);
  }

  async pause(): Promise<void> {
    if (this.details.state != TimerState.RUNNING) {
      return;
    }
    this.timerManager.get(PomodoroTimer.TIMER_NAME).clear();

    const diffTime = this.lastUpdated
      ? this.dateUtil.getCurrentDate().getTime() - this.lastUpdated.getTime()
      : 0;
    this.details = {
      ...this.details,
      state: TimerState.PAUSED,
      currentTime: this.details.currentTime - diffTime,
    };

    this.notifyDetails(true);

    this.lastUpdated = null;
  }

  async stop(timerType?: TimerType): Promise<void> {
    this.timerManager.get(PomodoroTimer.TIMER_NAME).clear();

    timerType ??= this.details.type;

    this.set(timerType);

    this.notifyDetails(true);

    this.lastUpdated = null;
  }

  /**
   * rendererに現在のタイマーの状態を通知する
   * @param forDisplayOnly
   * タイマー開始直後などに通知がならないようにするためのフラグ
   */
  private notifyDetails(forDisplayOnly = false): void {
    this.ipcService.send(
      IpcChannel.POMODORO_TIMER_CURRENT_DETAILS_NOTIFY,
      this.details,
      forDisplayOnly
    );
  }
}
