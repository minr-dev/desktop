import { set, addMinutes } from 'date-fns';
import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import type { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import { ITaskProcessor } from './ITaskProcessor';
import type { IUserDetailsService } from './IUserDetailsService';
import { IpcService } from './IpcService';
import { IpcChannel } from '@shared/constants';
import { SpeakTextGenerator } from './SpeakTextGenerator';
import { DateUtil } from '@shared/utils/DateUtil';
import { TimerManager } from '@shared/utils/TimerManager';
import { getLogger } from '@main/utils/LoggerUtil';

const logger = getLogger('SpeakTimeNotifyProcessorImpl');

/**
 * 時報を通知する
 *
 * 60分以内の時報のタイマーをセットして、タイマーで登録した関数で、
 * 時報を通知する。
 *
 * 実際の読み上げは、ブラウザの speech 機能を使うので、renderer プロセスで行う。
 * 本クラスは、発話するテキストを作成して、renderer プロセスに通知するだけ。
 */
@injectable()
export class SpeakTimeNotifyProcessorImpl implements ITaskProcessor {
  static readonly TIMER_NAME = 'SpeakTimeNotifyProcessorImpl';

  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.UserPreferenceStoreService)
    private readonly userPreferenceStoreService: IUserPreferenceStoreService,
    @inject(TYPES.IpcService)
    private readonly ipcService: IpcService,
    @inject(TYPES.SpeakTextGenerator)
    private readonly speakTextGenerator: SpeakTextGenerator,
    @inject(TYPES.DateUtil)
    private readonly dateUtil: DateUtil,
    @inject(TYPES.TimerManager)
    private readonly timerManager: TimerManager
  ) {}

  private async getUserId(): Promise<string> {
    const userDetails = await this.userDetailsService.get();
    return userDetails.userId;
  }

  async execute(): Promise<void> {
    if (logger.isDebugEnabled()) logger.debug('SpeakTimeNotifyProcessorImpl.execute');

    // 既存のタイマーをクリア
    const timer = this.timerManager.get(SpeakTimeNotifyProcessorImpl.TIMER_NAME);
    timer.clear();

    // アプリ設定の「時間の読み上げ」がオフなら何もしない
    const userPreference = await this.userPreferenceStoreService.getOrCreate(
      await this.getUserId()
    );
    if (!userPreference.speakTimeSignal) {
      return;
    }

    const now = this.dateUtil.getCurrentDate();
    let time = set(now, {
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    for (let m = 0; m < 60; m += userPreference.timeSignalInterval) {
      time = addMinutes(time, userPreference.timeSignalInterval);
      const ms = time.getTime() - now.getTime();
      if (ms < 0) {
        continue;
      }
      const text = this.speakTextGenerator.timeSignalText(
        userPreference.timeSignalTextTemplate,
        time
      );
      if (logger.isDebugEnabled())
        logger.debug('SpeakTimeNotifyProcessorImpl.execute: timeout', text, ms);
      timer.addTimeout(() => {
        this.sendSpeakText(text);
      }, ms);
    }
  }

  async terminate(): Promise<void> {
    this.timerManager.clear(SpeakTimeNotifyProcessorImpl.TIMER_NAME);
    return Promise.resolve();
  }

  sendSpeakText(text: string): void {
    this.ipcService.send(IpcChannel.SPEAK_TEXT_NOTIFY, text);
  }
}
