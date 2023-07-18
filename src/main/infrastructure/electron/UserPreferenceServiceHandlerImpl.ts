import { IpcChannel } from '@shared/constants';
import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';
import type { IUserPreferenceStoreService } from '@main/services/IUserPreferenceStoreService';
import type { IIpcHandlerInitializer } from './IIpcHandlerInitializer';
import { TYPES } from '@main/types';

@injectable()
export class UserPreferenceStoreServiceHandlerImpl implements IIpcHandlerInitializer {
  constructor(
    @inject(TYPES.UserPreferenceStoreService)
    private readonly userPreferenceService: IUserPreferenceStoreService
  ) {}

  init(): void {
    ipcMain.handle(IpcChannel.USER_PREFERENCE_CREATE, async () => {
      return await this.userPreferenceService.create();
    });

    ipcMain.handle(IpcChannel.USER_PREFERENCE_GET, async () => {
      const userPreference = await this.userPreferenceService.get();
      return userPreference;
    });

    ipcMain.handle(IpcChannel.USER_PREFERENCE_SAVE, async (_event, userPreference) => {
      await this.userPreferenceService.save(userPreference);
    });
  }
}
