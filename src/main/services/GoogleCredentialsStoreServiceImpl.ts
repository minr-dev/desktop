import Store from 'electron-store';
import { Credentials } from '@shared/dto/Credentials';
import { ICredentialsStoreService } from './ICredentialsStoreService';
import { injectable } from 'inversify';

const CHANNEL_NAME = 'googleCredentials';

@injectable()
export class GoogleCredentialsStoreServiceImpl implements ICredentialsStoreService {
  private store: Store;

  constructor() {
    this.store = new Store();
  }

  async get(): Promise<Credentials | undefined> {
    const data = this.store.get(CHANNEL_NAME);
    if (data) {
      return data as Credentials;
    }
    return undefined;
  }

  async save(data: Credentials): Promise<void> {
    this.store.set(CHANNEL_NAME, data);
  }

  async delete(): Promise<void> {
    this.store.delete(CHANNEL_NAME);
  }
}
