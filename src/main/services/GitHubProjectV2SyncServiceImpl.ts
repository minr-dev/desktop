import { inject, injectable } from 'inversify';
import { IGitHubProjectV2SyncService } from './IGitHubProjectV2SyncService';
import { TYPES } from '@main/types';
import type { IGitHubService } from './IGitHubService';
import type { IGitHubProjectV2StoreService } from './IGitHubProjectV2StoreService';
import type { IGitHubOrganizationStoreService } from './IGitHubOrganizationStoreService';

@injectable()
export class GitHubProjectV2SyncServiceImpl implements IGitHubProjectV2SyncService {
  constructor(
    @inject(TYPES.GitHubService)
    private readonly gitHubService: IGitHubService,
    @inject(TYPES.GitHubProjectV2StoreService)
    private readonly gitHubProjectV2StoreService: IGitHubProjectV2StoreService,
    @inject(TYPES.GitHubOrganizationStoreService)
    private readonly gitHubOrganizationStoreService: IGitHubOrganizationStoreService
  ) {}

  async syncProjectV2(): Promise<void> {
    const remotoOrganization = await this.gitHubService.fetchOrganizations();
    const remotoGitHubProjectV2 = await this.gitHubService.fetchProjectsV2(remotoOrganization);
    const localGitHubProjectV2 = (
      await this.gitHubProjectV2StoreService.findByIds(
        remotoGitHubProjectV2.map((gitHubProjectV2) => gitHubProjectV2.id)
      )
    ).map((gitHubProjectV2) => gitHubProjectV2.id);

    for (const gitHubProjectV2 of remotoGitHubProjectV2) {
      if (!localGitHubProjectV2.includes(gitHubProjectV2.id)) {
        await this.gitHubProjectV2StoreService.save(gitHubProjectV2);
      }
    }
  }

  async syncOrganization(): Promise<void> {
    const remotoOrganization = await this.gitHubService.fetchOrganizations();
    const localOrgainzation = (
      await this.gitHubOrganizationStoreService.findByIds(
        remotoOrganization.map((organization) => organization.id)
      )
    ).map((organization) => organization.id);

    for (const organization of remotoOrganization) {
      if (!localOrgainzation.includes(organization.id)) {
        await this.gitHubOrganizationStoreService.save(organization);
      }
    }
  }
}
