import { GitHubCredentials } from '@shared/data/GitHubCredentials';
import { ICredentialsStoreService } from './ICredentialsStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '@main/types';
import { DataSource } from './DataSource';

/**
 * GitHub認証情報のローカル保存に関するサービス
 */
@injectable()
export class GitHubCredentialsStoreServiceImpl
  implements ICredentialsStoreService<GitHubCredentials>
{
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<GitHubCredentials>
  ) {
    this.dataSource.createDb(this.tableName, [
      { fieldName: 'userId', unique: true },
      { fieldName: 'id', unique: true },
    ]);
  }

  get tableName(): string {
    return 'github-credentials.db';
  }

  async get(userId: string): Promise<GitHubCredentials | undefined> {
    return this.dataSource.get(this.tableName, { userId: userId });
  }

  async save(data: GitHubCredentials): Promise<GitHubCredentials> {
    data.updated = new Date();
    return this.dataSource.upsert(this.tableName, data);
  }

  async delete(userId: string): Promise<void> {
    this.dataSource.delete(this.tableName, { userId: userId });
  }
}
