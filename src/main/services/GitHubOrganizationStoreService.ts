import { GitHubOrganization } from '@shared/data/GitHubOrganization';
import { IGitHubOrganizationStoreService } from './IGitHubOrganizationStoreService';
import { TYPES } from '@main/types';
import { inject, injectable } from 'inversify';
import { DataSource } from './DataSource';
import type { IUserDetailsService } from './IUserDetailsService';

@injectable()
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

  async get(id: string): Promise<GitHubOrganization> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.get(this.tableName, { id, minr_user_id: userId });
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

  async bulkDelete(ids: string[]): Promise<void> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.delete(this.tableName, { id: { $in: ids }, minr_user_id: userId });
  }
}
