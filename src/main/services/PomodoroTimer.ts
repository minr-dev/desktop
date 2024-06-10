import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import { IpcService } from './IpcService';
import { IpcChannel } from '@shared/constants';
import { DateUtil } from '@shared/utils/DateUtil';
import { TimerManager } from '@shared/utils/TimerManager';
import type { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import type { IUserDetailsService } from './IUserDetailsService';
import { PomodoroTimerDetails, TimerState, TimerSession } from '@shared/data/PomodoroTimerDetails';
import { UserPreference } from '@shared/data/UserPreference';
import { PomodoroNotificationSetting } from '@shared/data/PomodoroNotificationSetting';

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
    session: TimerSession.WORK,
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
    session: TimerSession,
    userPreference: UserPreference
  ): Promise<number | null> {
    switch (session) {
      case TimerSession.WORK:
        return userPreference.workingMinutes * 60 * 1000;
      case TimerSession.BREAK:
        return userPreference.breakMinutes * 60 * 1000;
    }
  }

  /**
   * 現在のタイマーが停止した後のセッションを返す。
   */
  private async getNextSession(): Promise<TimerSession> {
    switch (this.details.session) {
      case TimerSession.WORK:
        return TimerSession.BREAK;
      case TimerSession.BREAK:
        return TimerSession.WORK;
    }
  }

  async getCurrentDetails(): Promise<PomodoroTimerDetails> {
    return this.details;
  }

  private async updateTime(): Promise<void> {
    const timer = this.timerManager.get(PomodoroTimer.TIMER_NAME);
    timer.clear();

    if (this.details.currentTime > 0) {
      this.lastUpdated = this.dateUtil.getCurrentDate();

      // 整数秒になるように時間を更新する
      const intervalMs = this.details.currentTime % 1000 || 1000;
      // 次の時間の更新をセットする
      timer.addTimeout(() => {
        this.details.currentTime -= intervalMs;
        this.updateTime();
      }, intervalMs);
    }

    this.notifyDetails();

    const userPreference = await this.userPreferenceStoreService.getOrCreate(
      await this.getUserId()
    );

    // 残り時間が0秒になったときの処理
    if (this.details.currentTime <= 0) {
      this.sendNotification(userPreference.notifyAtPomodoroComplete);
      const session = await this.getNextSession();
      await this.set(session);
      await this.start();
      return;
    }

    // 残り時間n秒前の処理
    const offsetMs = userPreference.notifyBeforePomodoroCompleteTimeOffset * 60 * 1000;
    if (this.details.currentTime == offsetMs) {
      this.sendNotification(userPreference.notifyBeforePomodoroComplete);
    }
  }

  async set(session: TimerSession): Promise<void> {
    const userPreference = await this.userPreferenceStoreService.getOrCreate(
      await this.getUserId()
    );
    const initialMs = await this.getInitialMs(session, userPreference);
    if (initialMs == null) {
      return;
    }
    this.details = {
      session: session,
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
      await this.set(this.details.session);
    }

    this.details.state = TimerState.RUNNING;

    this.notifyDetails();

    await this.updateTime();
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

  async stop(session?: TimerSession): Promise<void> {
    this.timerManager.get(PomodoroTimer.TIMER_NAME).clear();

    session ??= this.details.session;

    await this.set(session);

    this.notifyDetails();

    this.lastUpdated = null;
  }

  private notifyDetails(): void {
    this.ipcService.send(IpcChannel.POMODORO_TIMER_CURRENT_DETAILS_NOTIFY, this.details);
  }

  private sendNotification(setting: PomodoroNotificationSetting): void {
    const session = this.details.session == TimerSession.WORK ? '作業時間' : '休憩時間';
    const time = Math.ceil(this.details.currentTime / (60 * 1000));
    const text = setting.template.replace('{TIME}', time.toString()).replace('{SESSION}', session);
    if (setting.announce) {
      this.ipcService.send(IpcChannel.SPEAK_TEXT_NOTIFY, text);
    }
    if (setting.sendNotification) {
      this.ipcService.send(IpcChannel.NOTIFICATION_NOTIFY, text);
    }
  }
}
