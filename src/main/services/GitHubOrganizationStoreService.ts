import { GitHubOrganization } from '@shared/data/GitHubOrganization';
import { IGitHubOrganizationStoreService } from './IGitHubOrganizationStoreService';
import { TYPES } from '@main/types';
import { inject } from 'inversify';
import { DataSource } from './DataSource';
import type { IUserDetailsService } from './IUserDetailsService';

export class GitHubOrganizationStoreService implements IGitHubOrganizationStoreService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<GitHubOrganization>,
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService
  ) {
    this.dataSource.createDb(this.tableName, [{ fieldName: 'id', unique: true }]);
  }

  get tableName(): string {
    return 'github_organization.db';
  }

  async list(): Promise<GitHubOrganization[]> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.find(this.tableName, { minr_user_id: userId }, { updated_at: -1 });
  }

  async findByIds(ids: string[]): Promise<GitHubOrganization[]> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.find(
      this.tableName,
      { id: { $in: ids }, minr_user_id: userId },
      { updated_at: -1 }
    );
  }

  async save(data: GitHubOrganization): Promise<GitHubOrganization> {
    return await this.dataSource.upsert(this.tableName, data);
  }
}
