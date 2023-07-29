import { UserPreference } from '@shared/dto/UserPreference';
import { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';

const DB_NAME = 'userPreference.db';

@injectable()
export class UserPreferenceStoreServiceImpl implements IUserPreferenceStoreService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<UserPreference>
  ) {
    this.dataSource.initDb(DB_NAME, []);
  }

  async get(): Promise<UserPreference | undefined> {
    return await this.dataSource.get(DB_NAME, {});
  }

  async create(): Promise<UserPreference> {
    return {
      syncGoogleCalendar: false,
      calendars: [],
      announceTimeSignal: false,
      timeSignalInterval: -10,
      timeSignalTextTemplate: '',
      updated: new Date(),
    };
  }

  async getOrCreate(): Promise<UserPreference> {
    let data = await this.get();
    if (!data) {
      data = await this.create();
    }
    return data;
  }

  async save(data: UserPreference): Promise<UserPreference> {
    data.updated = new Date();
    return await this.dataSource.upsert(DB_NAME, {}, data);
  }
}
