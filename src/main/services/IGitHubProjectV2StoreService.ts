import { GitHubProjectV2 } from '@shared/data/GitHubProjectV2';

export interface IGitHubProjectV2StoreService {
  list(): Promise<GitHubProjectV2[]>;
  findByIds(ids: string[]): Promise<GitHubProjectV2[]>;
  save(event: GitHubProjectV2): Promise<GitHubProjectV2>;
  bulkDelete(ids: string[]): Promise<void>;
}
