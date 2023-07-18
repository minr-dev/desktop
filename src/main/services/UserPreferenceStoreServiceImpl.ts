import Store from 'electron-store';
import { UserPreference } from '@shared/dto/UserPreference';
import { IUserPreferenceStoreService } from './IUserPreferenceStoreService';
import { injectable } from 'inversify';

const CHANNEL_NAME = 'userPreference';

@injectable()
export class UserPreferenceStoreServiceImpl implements IUserPreferenceStoreService {
  private store: Store;

  constructor() {
    this.store = new Store();
  }

  async get(): Promise<UserPreference | undefined> {
    const data = this.store.get(CHANNEL_NAME);
    if (data) {
      return data as UserPreference;
    }
    return undefined;
  }

  async create(): Promise<UserPreference> {
    const data = await this.get();
    if (data) {
      return data;
    }
    return {
      syncGoogleCalendar: false,
      calendars: [],
      announceTimeSignal: false,
      timeSignalInterval: -10,
      timeSignalTextTemplate: '',
    };
  }

  async getOrCreate(): Promise<UserPreference> {
    let data = await this.get();
    if (!data) {
      data = await this.create();
    }
    return data;
  }

  async save(data: UserPreference): Promise<void> {
    this.store.set(CHANNEL_NAME, data);
  }
}
