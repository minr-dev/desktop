import { UserPreference } from '@shared/dto/UserPreference';
import { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';

@injectable()
export class UserPreferenceStoreServiceImpl implements IUserPreferenceStoreService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<UserPreference>
  ) {
    this.dataSource.createDb(this.tableName, []);
  }

  get tableName(): string {
    return 'userPreference.db';
  }

  async get(): Promise<UserPreference | undefined> {
    return await this.dataSource.get(this.tableName, {});
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
    return await this.dataSource.upsert(this.tableName, data);
  }
}
