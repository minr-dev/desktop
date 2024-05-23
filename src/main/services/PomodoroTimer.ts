import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import { IpcService } from './IpcService';
import { IpcChannel } from '@shared/constants';
import { DateUtil } from '@shared/utils/DateUtil';
import { TimerManager } from '@shared/utils/TimerManager';
import type { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import type { IUserDetailsService } from './IUserDetailsService';
import { PomodoroTimerDetails, TimerState, TimerType } from '@shared/data/PomodoroTimerDetails';
import { UserPreference } from '@shared/data/UserPreference';

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

  private async getInitialMs(
    timerType: TimerType,
    userPreference: UserPreference
  ): Promise<number | null> {
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

    const timer = this.timerManager.get(PomodoroTimer.TIMER_NAME);
    timer.clear();

    if (this.details.currentTime > 0) {
      // 次の時間の更新をセットする
      // 残り時間が整数秒でないときに、次の通知が整数秒で送られるように調整
      const intervalMs = this.details.currentTime % 1000 || 1000;
      timer.addTimeout(() => {
        this.updateTime(intervalMs);
      }, intervalMs);
    }

    this.notifyDetails();

    const userPreference = await this.userPreferenceStoreService.getOrCreate(
      await this.getUserId()
    );

    // 残り時間が0秒になったときの処理
    if (this.details.currentTime <= 0) {
      const template = userPreference.sendNotificationTextTemplate;
      this.sendSpeakText(template);
      this.sendNotification(template);
      const timerType = await this.getNextTimerType();
      await this.set(timerType);
      await this.start();
      return;
    }

    // 残り時間n秒前の処理
    const currentMinutes = this.details.currentTime / (60 * 1000);
    if (currentMinutes == userPreference.sendNotificationTimeOffset) {
      const template = userPreference.sendNotificationTextTemplate;
      this.sendNotification(template);
    }
  }

  private async set(timerType: TimerType): Promise<void> {
    const userPreference = await this.userPreferenceStoreService.getOrCreate(
      await this.getUserId()
    );
    const initialMs = await this.getInitialMs(timerType, userPreference);
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
      await this.set(this.details.type);
    }

    this.details.state = TimerState.RUNNING;

    this.notifyDetails();

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

    this.notifyDetails();

    this.lastUpdated = null;
  }

  async stop(timerType?: TimerType): Promise<void> {
    this.timerManager.get(PomodoroTimer.TIMER_NAME).clear();

    timerType ??= this.details.type;

    this.set(timerType);

    this.notifyDetails();

    this.lastUpdated = null;
  }

  private notifyDetails(): void {
    this.ipcService.send(IpcChannel.POMODORO_TIMER_CURRENT_DETAILS_NOTIFY, this.details);
  }

  private sendSpeakText(template: string): void {
    console.log('sendSpeakText');
    const text = template.replace('{TIME}', this.details.currentTime.toString());
    this.ipcService.send(IpcChannel.SPEAK_TEXT_NOTIFY, text);
  }

  private sendNotification(template: string): void {
    console.log('sendNotification');
    const text = template.replace('{TIME}', this.details.currentTime.toString());
    this.ipcService.send(IpcChannel.NOTIFICATION_NOTIFY, text);
  }
}
