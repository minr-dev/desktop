import { GoogleCredentials } from '@shared/dto/GoogleCredentials';
import { ICredentialsStoreService } from './ICredentialsStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';

@injectable()
export class GoogleCredentialsStoreServiceImpl
  implements ICredentialsStoreService<GoogleCredentials>
{
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<GoogleCredentials>
  ) {
    this.dataSource.createDb(this.tableName, [
      { fieldName: 'userId', unique: true },
      { fieldName: 'sub', unique: true },
    ]);
  }

  get tableName(): string {
    return 'google-credentials.db';
  }

  async get(userId: string): Promise<GoogleCredentials | undefined> {
    return this.dataSource.get(this.tableName, { userId: userId });
  }

  async save(data: GoogleCredentials): Promise<GoogleCredentials> {
    data.updated = new Date();
    return this.dataSource.upsert(this.tableName, data);
  }

  async delete(userId: string): Promise<void> {
    this.dataSource.delete(this.tableName, { userId: userId });
  }
}
