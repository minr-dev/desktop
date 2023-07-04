import { IUserPreferenceService } from './IUserPreferenceService';
import { UserPreference } from '@shared/dto/UserPreference';
import Store from 'electron-store';
import { ipcMain } from 'electron';
import { IIpcInitializer } from './IIpcInitializer';

export class StoreUserPreferenceServiceImpl implements IUserPreferenceService, IIpcInitializer {
  private store: Store;

  constructor() {
    this.store = new Store();
  }

  init(): void {
    ipcMain.handle('get-UserPreference', async () => {
      const userPreference = await this.get();
      return userPreference;
    });

    ipcMain.handle('create-UserPreference', async () => {
      return await this.create();
    });

    ipcMain.handle('save-UserPreference', async (_event, userPreference) => {
      await this.save(userPreference);
    });
  }

  async get(): Promise<UserPreference | undefined> {
    const data = this.store.get('userPreference');
    if (data) {
      return data as UserPreference;
    }
    return undefined;
  }

  async create(): Promise<UserPreference> {
    const data = this.store.get('userPreference');
    if (data) {
      return data as UserPreference;
    }
    return {
      syncGoogleCalendar: false,
      accessToken: '',
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

  async save(userPreference: UserPreference): Promise<void> {
    this.store.set('userPreference', userPreference);
  }
}
