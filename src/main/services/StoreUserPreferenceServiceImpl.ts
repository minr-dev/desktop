import Store from 'electron-store';
import { ipcMain } from 'electron';
import { UserPreference } from '@shared/dto/UserPreference';
import { IUserPreferenceService } from './IUserPreferenceService';
import { IIpcInitializer } from './IIpcInitializer';

const CHANNEL_NAME = 'userPreference';

export class StoreUserPreferenceServiceImpl implements IUserPreferenceService, IIpcInitializer {
  private store: Store;

  constructor() {
    this.store = new Store();
  }

  init(): void {
    ipcMain.handle(`get-${CHANNEL_NAME}`, async () => {
      const userPreference = await this.get();
      return userPreference;
    });

    ipcMain.handle(`create-${CHANNEL_NAME}`, async () => {
      return await this.create();
    });

    ipcMain.handle(`save-${CHANNEL_NAME}`, async (_event, userPreference) => {
      await this.save(userPreference);
    });
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
