import { IpcChannel } from '@shared/constants';
import { IUserPreferenceProxy } from './IUserPreferenceProxy';
import { UserPreference } from '@shared/dto/UserPreference';
import { injectable } from 'inversify';

@injectable()
export class UserPreferenceProxyImpl implements IUserPreferenceProxy {
  async get(): Promise<UserPreference | undefined> {
    const data = await window.electron.ipcRenderer.invoke(IpcChannel.USER_PREFERENCE_GET);
    return data;
  }

  async create(): Promise<UserPreference> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.USER_PREFERENCE_CREATE);
  }

  async getOrCreate(): Promise<UserPreference> {
    let data = await this.get();
    if (!data) {
      data = await this.create();
    }
    return data;
  }

  async save(userPreference: UserPreference): Promise<void> {
    await window.electron.ipcRenderer.invoke(IpcChannel.USER_PREFERENCE_SAVE, userPreference);
  }
}
