import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { ICredentialsStoreService } from '@main/services/ICredentialsStoreService';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';

@injectable()
export class CredentialsStoreServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.CredentialsStoreService)
    private readonly googleCredentialsService: ICredentialsStoreService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.GOOGLE_CREDENTIALS_GET, async () => {
      const userPreference = await this.googleCredentialsService.get();
      return userPreference;
    });

    ipcMain.handle(IpcChannel.GOOGLE_CREDENTIALS_SAVE, async (_event, userPreference) => {
      await this.googleCredentialsService.save(userPreference);
    });
  }
}
