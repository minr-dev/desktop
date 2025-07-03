import { inject, injectable } from 'inversify';

import { TYPES } from '@main/types';
import { GitHubEvent } from '@shared/data/GitHubEvent';
import { DataSource } from './DataSource';
import type { IUserDetailsService } from './IUserDetailsService';
import { IGitHubEventStoreService } from './IGitHubEventStoreService';

/**
 * GitHub イベントをローカルに永続化するサービス
 */
@injectable()
export class GitHubEventStoreServiceImpl implements IGitHubEventStoreService {
  constructor(
    @inject(TYPES.DataSource)
    private readonly dataSource: DataSource<GitHubEvent>,
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService
  ) {
    this.dataSource.createDb(this.tableName, [{ fieldName: 'id', unique: true }]);
  }

  get tableName(): string {
    return 'github_activity.db';
  }

  async list(start: Date, end: Date): Promise<GitHubEvent[]> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.find(
      this.tableName,
      { updated_at: { $gte: start, $lt: end }, minr_user_id: userId },
      { updated_at: -1 }
    );
  }

  async findById(ids: string[]): Promise<GitHubEvent[]> {
    const userId = await this.userDetailsService.getUserId();
    return await this.dataSource.find(
      this.tableName,
      { id: { $in: ids }, minr_user_id: userId },
      { updated_at: -1 }
    );
  }

  async save(data: GitHubEvent): Promise<GitHubEvent> {
    return await this.dataSource.upsert(this.tableName, data);
  }
}
