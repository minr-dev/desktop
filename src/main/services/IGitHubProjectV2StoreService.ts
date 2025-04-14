import { GitHubProjectV2 } from '@shared/data/GitHubProjectV2';

export interface IGitHubProjectV2StoreService {
  list(): Promise<GitHubProjectV2[]>;
  findById(id: string): Promise<GitHubProjectV2>;
  save(event: GitHubProjectV2): Promise<GitHubProjectV2>;
}
