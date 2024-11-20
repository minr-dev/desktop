import { UserPreference } from '@shared/data/UserPreference';
import { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';
import { DateUtil } from '@shared/utils/DateUtil';

/**
 * ユーザー設定を保存するクラス
 *
 * DBにユーザー設定が残っている状態で、改修により設定項目が増えると、
 * その設定項目はDBから取得できず undefined になってしまう。
 * そのため、defaultUserPreference にDBの値を上書きする形をとることで、
 * 増えた設定項目をデフォルト値で取得できるようにしている。
 */
@injectable()
export class UserPreferenceStoreServiceImpl implements IUserPreferenceStoreService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<UserPreference>,
    @inject(TYPES.DateUtil)
    private readonly dateUtil: DateUtil
  ) {
    this.dataSource.createDb(this.tableName, [{ fieldName: 'userId', unique: true }]);
  }

  private defaultUserPreference: Omit<UserPreference, 'userId' | 'updated'> = {
    syncGoogleCalendar: false,
    calendars: [],

    startHourLocal: 9,
    dailyWorkStartTime: new Date('1970-01-01T10:00:00+0900'),
    dailyWorkHours: 8,
    dailyBreakTimeSlots: [
      { start: new Date('1970-01-01T12:00:00+0900'), end: new Date('1970-01-01T12:00:00+0900') },
    ],

    speakEvent: false,
    speakEventTimeOffset: 10,
    speakEventTextTemplate: '{TITLE} まで {READ_TIME_OFFSET} 秒前です',

    speakTimeSignal: false,
    timeSignalInterval: 30,
    timeSignalTextTemplate: '{TIME} です',

    muteWhileInMeeting: true,

    workingMinutes: 25,
    breakMinutes: 5,
    notifyAtPomodoroComplete: {
      useVoiceNotification: true,
      useDesktopNotification: false,
      notificationTimeOffset: 0,
      notificationTemplate: '{SESSION}が終了しました。',
    },
    notifyBeforePomodoroComplete: {
      useVoiceNotification: false,
      useDesktopNotification: true,
      notificationTimeOffset: 10,
      notificationTemplate: '{SESSION}終了まであと{TIME}分です。',
    },
  };

  get tableName(): string {
    return 'userPreference.db';
  }

  async get(userId: string): Promise<UserPreference | undefined> {
    const userPreference = await this.dataSource.get(this.tableName, { userId: userId });
    if (!userPreference) {
      return undefined;
    }
    return {
      ...this.defaultUserPreference,
      ...userPreference,
    };
  }

  async create(userId: string): Promise<UserPreference> {
    return {
      userId: userId,
      ...this.defaultUserPreference,
      updated: this.dateUtil.getCurrentDate(),
    };
  }

  async getOrCreate(userId: string): Promise<UserPreference> {
    let data = await this.get(userId);
    if (!data) {
      data = await this.create(userId);
    }
    return data;
  }

  async save(data: UserPreference): Promise<UserPreference> {
    data.updated = this.dateUtil.getCurrentDate();
    return await this.dataSource.upsert(this.tableName, data);
  }
}
