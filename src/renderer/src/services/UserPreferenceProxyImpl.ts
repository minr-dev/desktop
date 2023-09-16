import { IpcChannel } from '@shared/constants';
import { IUserPreferenceProxy } from './IUserPreferenceProxy';
import { UserPreference } from '@shared/data/UserPreference';
import { injectable } from 'inversify';

@injectable()
export class UserPreferenceProxyImpl implements IUserPreferenceProxy {
  async get(userId: string): Promise<UserPreference | undefined> {
    const data = await window.electron.ipcRenderer.invoke(IpcChannel.USER_PREFERENCE_GET, userId);
    return data;
  }

  async create(userId: string): Promise<UserPreference> {
    return await window.electron.ipcRenderer.invoke(IpcChannel.USER_PREFERENCE_CREATE, userId);
  }

  async getOrCreate(userId: string): Promise<UserPreference> {
    let data = await this.get(userId);
    if (!data) {
      data = await this.create(userId);
    }
    return data;
  }

  async save(userPreference: UserPreference): Promise<UserPreference> {
    return await window.electron.ipcRenderer.invoke(
      IpcChannel.USER_PREFERENCE_SAVE,
      userPreference
    );
  }
}
