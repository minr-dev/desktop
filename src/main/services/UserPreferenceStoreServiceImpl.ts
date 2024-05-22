import { UserPreference } from '@shared/data/UserPreference';
import { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';
import { DateUtil } from '@shared/utils/DateUtil';

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

  get tableName(): string {
    return 'userPreference.db';
  }

  async get(userId: string): Promise<UserPreference | undefined> {
    return await this.dataSource.get(this.tableName, { userId: userId });
  }

  async create(userId: string): Promise<UserPreference> {
    return {
      userId: userId,

      syncGoogleCalendar: false,
      calendars: [],

      startHourLocal: 9,

      speakEvent: false,
      speakEventTimeOffset: 10,
      speakEventTextTemplate: '{TITLE} まで {READ_TIME_OFFSET} 秒前です',

      speakTimeSignal: false,
      timeSignalInterval: 30,
      timeSignalTextTemplate: '{TIME} です',

      muteWhileInMeeting: true,

      workingMinutes: 2,
      breakMinutes: 1,
      sendNotification: false,
      sendNotificationTimeOffset: 15,
      sendNotificationTextTemplate: '終了まで {NOTIFICATION_TIME_OFFSET} 分前です',

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
