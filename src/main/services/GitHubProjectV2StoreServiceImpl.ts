import { GitHubProjectV2 } from '@shared/data/GitHubProjectV2';
import { IGitHubProjectV2StoreService } from './IGitHubProjectV2StoreService';
import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import { DataSource } from './DataSource';
import type { IUserDetailsService } from './IUserDetailsService';

@injectable()
export class GitHubProjectV2StoreServiceImpl implements IGitHubProjectV2StoreService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<GitHubProjectV2>,
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService
  ) {
    this.dataSource.createDb(this.tableName, [{ fieldName: 'id', unique: true }]);
  }

  get tableName(): string {
    return 'github_project_v2.db';
  }

  async list(): Promise<GitHubProjectV2[]> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.find(this.tableName, { minr_user_id: userId }, { updated_at: -1 });
  }

  async get(id: string): Promise<GitHubProjectV2> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.get(this.tableName, { id, minr_user_id: userId });
  }

  async findByIds(ids: string[]): Promise<GitHubProjectV2[]> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.find(this.tableName, { id: { $in: ids }, minr_user_id: userId });
  }

  async save(data: GitHubProjectV2): Promise<GitHubProjectV2> {
    return await this.dataSource.upsert(this.tableName, data);
  }
}
