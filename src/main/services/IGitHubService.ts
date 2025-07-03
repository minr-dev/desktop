import { GitHubEvent } from '@shared/data/GitHubEvent';
import { GitHubOrganization } from '@shared/data/GitHubOrganization';
import { GitHubProjectV2 } from '@shared/data/GitHubProjectV2';
import { GitHubProjectV2Item } from '@shared/data/GitHubProjectV2Item';

export interface IGitHubService {
  fetchOrganizations(): Promise<GitHubOrganization[]>;
  fetchProjectsV2(organizations: GitHubOrganization[]): Promise<GitHubProjectV2[]>;
  fetchProjectV2Items(project: GitHubProjectV2): Promise<GitHubProjectV2Item[]>;
  fetchEvents(until: Date): Promise<GitHubEvent[]>;
}
