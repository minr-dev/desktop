import { GitHubProjectV2 } from '@shared/data/GitHubProjectV2';

export interface IGitHubProjectV2Proxy {
  list(): Promise<GitHubProjectV2[]>;
}
