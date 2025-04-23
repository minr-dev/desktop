import { GitHubProjectV2Item } from '@shared/data/GitHubProjectV2Item';

export interface IGitHubProjectV2ItemStoreService {
  list(): Promise<GitHubProjectV2Item[]>;
  findByIds(ids: string[]): Promise<GitHubProjectV2Item[]>;
  save(event: GitHubProjectV2Item): Promise<GitHubProjectV2Item>;
}
