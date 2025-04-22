import { GitHubOrganization } from '@shared/data/GitHubOrganization';

export interface IGitHubOrganizationStoreService {
  list(): Promise<GitHubOrganization[]>;
  findByIds(ids: string[]): Promise<GitHubOrganization[]>;
  save(event: GitHubOrganization): Promise<GitHubOrganization>;
  bulkDelete(ids: string[]): Promise<void>;
}
