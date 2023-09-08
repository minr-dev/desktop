import { GitHubEvent } from '@shared/dto/GitHubEvent';

export interface IGitHubService {
  fetchEvents(until: Date): Promise<GitHubEvent[]>;
}
