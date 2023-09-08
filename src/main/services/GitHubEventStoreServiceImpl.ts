import { inject, injectable } from 'inversify';

import { TYPES } from '@main/types';
import { GitHubEvent } from '@shared/dto/GitHubEvent';
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

  async save(data: GitHubEvent): Promise<GitHubEvent> {
    data.minr_user_id = await this.userDetailsService.getUserId();
    if (!data.updated_at) {
      data.updated_at = data.created_at;
    }
    return await this.dataSource.upsert(this.tableName, data);
  }
}
