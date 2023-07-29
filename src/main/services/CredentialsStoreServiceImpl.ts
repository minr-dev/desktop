import { Credentials } from '@shared/dto/Credentials';
import { ICredentialsStoreService } from './ICredentialsStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';

const DB_NAME = 'credentials.db';

@injectable()
export class CredentialsStoreServiceImpl implements ICredentialsStoreService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<Credentials>
  ) {
    this.dataSource.initDb(DB_NAME, [{ fieldName: 'sub', unique: true }]);
  }

  async get(): Promise<Credentials | undefined> {
    return this.dataSource.get(DB_NAME, {});
  }

  async save(data: Credentials): Promise<Credentials> {
    data.updated = new Date();
    return this.dataSource.upsert(DB_NAME, {}, data);
  }

  async delete(): Promise<void> {
    this.dataSource.delete(DB_NAME, {});
  }
}
