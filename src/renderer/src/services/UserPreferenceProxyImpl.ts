import { IUserPreferenceProxy } from './IUserPreferenceProxy';
import { UserPreference } from '@shared/dto/UserPreference';

export class UserPreferenceProxyImpl implements IUserPreferenceProxy {
  async get(): Promise<UserPreference | undefined> {
    const data = await window.electron.ipcRenderer.invoke('get-UserPreference');
    return data;
  }

  async create(): Promise<UserPreference> {
    return await window.electron.ipcRenderer.invoke('create-UserPreference');
  }

  async getOrCreate(): Promise<UserPreference> {
    let data = await window.electron.ipcRenderer.invoke('get-UserPreference');
    if (!data) {
      data = await this.create();
    }
    return data;
  }

  async save(userPreference: UserPreference): Promise<void> {
    await window.electron.ipcRenderer.invoke('save-UserPreference', userPreference);
  }
}
