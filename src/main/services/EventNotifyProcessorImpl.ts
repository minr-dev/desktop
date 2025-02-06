import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import type { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import type { IEventEntryService } from './IEventEntryService';
import { EVENT_TYPE, EventEntry } from '@shared/data/EventEntry';
import { ITaskProcessor } from './ITaskProcessor';
import type { IUserDetailsService } from './IUserDetailsService';
import { IpcService } from './IpcService';
import { IpcChannel } from '@shared/constants';
import { UserPreference } from '@shared/data/UserPreference';
import { SpeakTextGenerator } from './SpeakTextGenerator';
import { DateUtil } from '@shared/utils/DateUtil';
import { TimerManager } from '@shared/utils/TimerManager';
import { getLogger } from '@main/utils/LoggerUtil';

const logger = getLogger('EventNotifyProcessorImpl');

/**
 * 予定を通知する
 *
 * 現在時刻から1時間以内のイベントを取得して、イベントの通知時間にあわせて setTimeout する。
 * 前回の実行時にセットした setTimeout があれば、いったん、全部を clear してから、再設定する。
 * 通知したものも clearTimeout する。
 *
 * 実際の読み上げやデスクトップ通知は、ブラウザの speach 機能と Notification 機能を使うので、renderer プロセスで行う。
 * 本クラスは、通知するテキストを作成して、renderer プロセスに通知するだけ。
 */
@injectable()
export class EventNotifyProcessorImpl implements ITaskProcessor {
  static readonly TIMER_NAME = 'SpeakEventNotifyProcessorImpl';

  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.UserPreferenceStoreService)
    private readonly userPreferenceStoreService: IUserPreferenceStoreService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService,
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
    if (logger.isDebugEnabled()) logger.debug('SpeakEventNotifyProcessorImpl.execute');

    // 既存のタイマーをクリア
    const timer = this.timerManager.get(EventNotifyProcessorImpl.TIMER_NAME);
    timer.clear();

    // 現在時刻から1時間以内のイベントのみスケジュール
    const now = this.dateUtil.getCurrentDate();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const minrEventsAll = await this.eventEntryService.list(
      await this.getUserId(),
      now,
      oneHourLater
    );
    const minrEvents = minrEventsAll
      .filter((ev) => !ev.deleted)
      .filter((ev) => !ev.isProvisional)
      .filter((ev) => ev.eventType === EVENT_TYPE.PLAN || ev.eventType === EVENT_TYPE.SHARED);

    const userPreference = await this.userPreferenceStoreService.getOrCreate(
      await this.getUserId()
    );
    const defaultDelay = userPreference.speakEventTimeOffset * 1000;

    for (const minrEvent of minrEvents) {
      if (!minrEvent.start.dateTime) {
        continue;
      }

      // デスクトップ通知の設定
      if (minrEvent.notificationSetting?.useDesktopNotification) {
        const delay = minrEvent.notificationSetting.notificationTimeOffset * 1000;
        const n = minrEvent.start.dateTime.getTime() - delay - now.getTime();
        if (n > 0) {
          timer.addTimeout(() => {
            this.sendNotifyText(minrEvent, userPreference, IpcChannel.SEND_DESKTOP_NOTIFY);
          }, n);
        }
      }

      // 音声通知の設定

      // アプリ設定の「予定の読み上げ」がオフ、かつイベントのリマインダーの「音声で読み上げる」がオフなら音声通知を行わない
      if (!userPreference.speakEvent && !minrEvent.notificationSetting?.useVoiceNotification) {
        continue;
      }

      const delay = minrEvent.notificationSetting?.useVoiceNotification
        ? minrEvent.notificationSetting.notificationTimeOffset * 1000
        : defaultDelay;

      const n = minrEvent.start.dateTime.getTime() - delay - now.getTime();
      if (n <= 0) {
        continue;
      }
      timer.addTimeout(() => {
        this.sendNotifyText(minrEvent, userPreference, IpcChannel.SPEAK_TEXT_NOTIFY);
      }, n);
    }
  }

  async terminate(): Promise<void> {
    this.timerManager.clear(EventNotifyProcessorImpl.TIMER_NAME);
    return Promise.resolve();
  }

  sendNotifyText(
    minrEvent: EventEntry,
    userPreference: UserPreference,
    notifyChannel: IpcChannel
  ): void {
    if (!minrEvent.start.dateTime) {
      throw new Error('minrEvent.start.dateTime is undefined');
    }
    if (
      notifyChannel !== IpcChannel.SPEAK_TEXT_NOTIFY &&
      notifyChannel !== IpcChannel.SEND_DESKTOP_NOTIFY
    ) {
      throw new Error('unknown notify channel');
    }

    const eventNotificationSetting = minrEvent.notificationSetting;

    if (
      notifyChannel === IpcChannel.SEND_DESKTOP_NOTIFY &&
      !eventNotificationSetting?.useDesktopNotification
    ) {
      throw new Error('desktop notification is unavailable');
    }

    const useEventNotificationSetting =
      (notifyChannel === IpcChannel.SPEAK_TEXT_NOTIFY &&
        eventNotificationSetting?.useVoiceNotification) ||
      (notifyChannel === IpcChannel.SEND_DESKTOP_NOTIFY &&
        eventNotificationSetting?.useDesktopNotification);

    const notifyEventTimeOffset = useEventNotificationSetting
      ? eventNotificationSetting.notificationTimeOffset
      : userPreference.speakEventTimeOffset;
    const template = useEventNotificationSetting
      ? eventNotificationSetting.notificationTemplate
      : userPreference.speakEventTextTemplate;

    const text = template
      .replace('{TITLE}', minrEvent.summary)
      .replace('{READ_TIME_OFFSET}', `${notifyEventTimeOffset}`)
      .replace('{TIME}', this.speakTextGenerator.timeToText(minrEvent.start.dateTime));

    this.ipcService.send(notifyChannel, text);
  }
}
