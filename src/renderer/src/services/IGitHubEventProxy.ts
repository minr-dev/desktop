import { GitHubEvent } from '@shared/data/GitHubEvent';

export interface IGitHubEventProxy {
  list(start: Date, end: Date): Promise<GitHubEvent[]>;
}
