import { GitHubProjectV2Item } from '@shared/data/GitHubProjectV2Item';
import { IGitHubProjectV2ItemStoreService } from './IGitHubProjectV2ItemStoreService';
import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import { DataSource } from './DataSource';
import type { IUserDetailsService } from './IUserDetailsService';

@injectable()
export class GitHubProjectV2ItemStoreService implements IGitHubProjectV2ItemStoreService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<GitHubProjectV2Item>,
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService
  ) {
    this.dataSource.createDb(this.tableName, [{ fieldName: 'id', unique: true }]);
  }

  get tableName(): string {
    return 'github_project_v2_item.db';
  }

  async list(gitHubProjectV2Id: string): Promise<GitHubProjectV2Item[]> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.find(
      this.tableName,
      { projectId: gitHubProjectV2Id, minr_user_id: userId },
      { updated_at: -1 }
    );
  }

  async save(data: GitHubProjectV2Item): Promise<GitHubProjectV2Item> {
    return await this.dataSource.upsert(this.tableName, data);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.delete(this.tableName, { id: { $in: ids }, minr_user_id: userId });
  }
}
