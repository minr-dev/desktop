import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import type { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import type { IEventEntryService } from './IEventEntryService';
import { EVENT_TYPE, EventEntry } from '@shared/dto/EventEntry';
import { ITaskProcessor } from './ITaskProcessor';
import type { IUserDetailsService } from './IUserDetailsService';
import { IpcService } from './IpcService';
import { IpcChannel } from '@shared/constants';
import { UserPreference } from '@shared/dto/UserPreference';

/**
 * 読み上げイベントを通知する
 *
 * 現在時刻から1時間以内のイベントを取得して、イベントの読み上げ時間にあわせて setTimeout する。
 * 前回の実行時にセットした setTimeout があれば、いったん、全部を clear してから、再設定する。
 * 読み上げ通知したものも clearTimeout する。
 *
 * 実際の読み上げは、ブラウザの speech 機能を使うので、renderer プロセスで行う。
 * 本クラスは、発話するテキストを作成して、renderer プロセスに通知するだけ。
 */
@injectable()
export class SpeakEventNotifyProcessorImpl implements ITaskProcessor {
  private timeouts: NodeJS.Timeout[] = [];

  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.UserPreferenceStoreService)
    private readonly userPreferenceStoreService: IUserPreferenceStoreService,
    @inject(TYPES.EventEntryService)
    private readonly eventEntryService: IEventEntryService,
    @inject(TYPES.IpcService)
    private readonly ipcService: IpcService
  ) {}

  private async getUserId(): Promise<string> {
    const userDetails = await this.userDetailsService.get();
    return userDetails.userId;
  }

  async execute(): Promise<void> {
    console.log('SpeakEventgiProcessorImpl.execute');

    // 既存のタイマーをクリア
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts = [];

    // アプリ設定の「読み上げ」がオフなら何もしない
    const userPreference = await this.userPreferenceStoreService.getOrCreate(
      await this.getUserId()
    );
    if (!userPreference.speakEvent) {
      return;
    }

    // 現在時刻から1時間以内のイベントのみスケジュール
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const minrEventsAll = await this.eventEntryService.list(
      await this.getUserId(),
      now,
      oneHourLater
    );
    const minrEvents = minrEventsAll.filter(
      (ev) => ev.eventType === EVENT_TYPE.PLAN || ev.eventType === EVENT_TYPE.SHARED
    );
    for (const minrEvent of minrEvents) {
      if (!minrEvent.start.dateTime) {
        continue;
      }
      const n = minrEvent.start.dateTime.getTime() - now.getTime();
      if (n <= 0) {
        continue;
      }
      const timeout = setTimeout(() => {
        this.sendSpeakText(minrEvent, userPreference);
      }, n);
      this.timeouts.push(timeout);
    }
  }

  private sendSpeakText(minrEvent: EventEntry, userPreference: UserPreference): void {
    if (!minrEvent.start.dateTime) {
      throw new Error('minrEvent.start.dateTime is undefined');
    }
    const text = userPreference.speakEventTextTemplate
      .replace('{TITLE}', minrEvent.summary)
      .replace('{READ_TIME_OFFSET}', `${userPreference.speakEventTimeOffset}`)
      .replace('{START}', this.timeToText(minrEvent.start.dateTime));

    this.ipcService.send(IpcChannel.SPEAK_TEXT_NOTIFY, text);
  }

  private timeToText(time: Date): string {
    const hour = `${time.getHours()}時`;
    let minute;
    if (time.getMinutes() === 0) {
      minute = '';
    } else if (time.getMinutes() === 30) {
      minute = '半';
    } else {
      minute = time.getMinutes() + '分';
    }
    return `${hour}${minute}`;
  }
}
