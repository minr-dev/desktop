import Store from 'electron-store';
import { ipcMain } from 'electron';
import { GoogleCredentials } from '@shared/dto/GoogleCredentials';
import { IGoogleCredentialsService } from './IGoogleCredentialsService';
import { IIpcInitializer } from './IIpcInitializer';

const CHANNEL_NAME = 'googleCredentials';

export class StoreGoogleCredentialsServiceImpl
  implements IGoogleCredentialsService, IIpcInitializer
{
  private store: Store;

  constructor() {
    this.store = new Store();
  }

  init(): void {
    ipcMain.handle(`get-${CHANNEL_NAME}`, async () => {
      const userPreference = await this.get();
      return userPreference;
    });

    ipcMain.handle(`save-${CHANNEL_NAME}`, async (_event, userPreference) => {
      await this.save(userPreference);
    });
  }

  async get(): Promise<GoogleCredentials | undefined> {
    const data = this.store.get(CHANNEL_NAME);
    if (data) {
      return data as GoogleCredentials;
    }
    return undefined;
  }

  async save(data: GoogleCredentials): Promise<void> {
    this.store.set(CHANNEL_NAME, data);
  }
}
