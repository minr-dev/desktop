import { Credentials } from '@shared/dto/Credentials';
import { ICredentialsStoreService } from './ICredentialsStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';

@injectable()
export class CredentialsStoreServiceImpl implements ICredentialsStoreService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<Credentials>
  ) {
    this.dataSource.createDb(this.tableName, [
      { fieldName: 'userId', unique: true },
      { fieldName: 'sub', unique: true },
    ]);
  }

  get tableName(): string {
    return 'credentials.db';
  }

  async get(userId: string): Promise<Credentials | undefined> {
    return this.dataSource.get(this.tableName, { userId: userId });
  }

  async save(data: Credentials): Promise<Credentials> {
    data.updated = new Date();
    return this.dataSource.upsert(this.tableName, data);
  }

  async delete(userId: string): Promise<void> {
    this.dataSource.delete(this.tableName, { userId: userId });
  }
}
