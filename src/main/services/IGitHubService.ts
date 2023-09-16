import { GitHubEvent } from '@shared/data/GitHubEvent';

export interface IGitHubService {
  fetchEvents(until: Date): Promise<GitHubEvent[]>;
}
