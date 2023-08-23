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
    ipcMain.handle(IpcChannel.USER_PREFERENCE_CREATE, async (_event, userId: string) => {
      return await this.userPreferenceService.create(userId);
    });

    ipcMain.handle(IpcChannel.USER_PREFERENCE_GET, async (_event, userId: string) => {
      const userPreference = await this.userPreferenceService.get(userId);
      return userPreference;
    });

    ipcMain.handle(IpcChannel.USER_PREFERENCE_SAVE, async (_event, userPreference) => {
      return await this.userPreferenceService.save(userPreference);
    });
  }
}
