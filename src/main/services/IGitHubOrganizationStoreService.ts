import { GitHubOrganization } from '@shared/data/GitHubOrganization';

export interface IGitHubOrganizationStoreService {
  list(): Promise<GitHubOrganization[]>;
  get(id: string): Promise<GitHubOrganization>;
  save(event: GitHubOrganization): Promise<GitHubOrganization>;
  bulkDelete(ids: string[]): Promise<void>;
}
