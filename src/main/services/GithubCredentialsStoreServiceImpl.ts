import { GithubCredentials } from '@shared/dto/GithubCredentials';
import { ICredentialsStoreService } from './ICredentialsStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';

@injectable()
export class GithubCredentialsStoreServiceImpl
  implements ICredentialsStoreService<GithubCredentials>
{
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<GithubCredentials>
  ) {
    this.dataSource.createDb(this.tableName, [
      { fieldName: 'userId', unique: true },
      { fieldName: 'id', unique: true },
    ]);
  }

  get tableName(): string {
    return 'github-credentials.db';
  }

  async get(userId: string): Promise<GithubCredentials | undefined> {
    return this.dataSource.get(this.tableName, { userId: userId });
  }

  async save(data: GithubCredentials): Promise<GithubCredentials> {
    data.updated = new Date();
    return this.dataSource.upsert(this.tableName, data);
  }

  async delete(userId: string): Promise<void> {
    this.dataSource.delete(this.tableName, { userId: userId });
  }
}
