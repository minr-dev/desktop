import { GitHubEvent } from '@shared/dto/GitHubEvent';

export interface IGitHubEventProxy {
  list(start: Date, end: Date): Promise<GitHubEvent[]>;
}
