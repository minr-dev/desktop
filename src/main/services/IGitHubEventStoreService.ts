import { GitHubEvent } from '@shared/dto/GitHubEvent';

export interface IGitHubEventStoreService {
  list(startDate: Date, endDate: Date): Promise<GitHubEvent[]>;
  save(event: GitHubEvent): Promise<GitHubEvent>;
}
