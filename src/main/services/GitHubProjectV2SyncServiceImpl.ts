import { inject, injectable } from 'inversify';
import { IGitHubProjectV2SyncService } from './IGitHubProjectV2SyncService';
import { TYPES } from '@main/types';
import type { IGitHubService } from './IGitHubService';
import type { IGitHubProjectV2StoreService } from './IGitHubProjectV2StoreService';
import type { IGitHubOrganizationStoreService } from './IGitHubOrganizationStoreService';
import { getLogger } from '@main/utils/LoggerUtil';
import type { IGitHubProjectV2ItemStoreService } from './IGitHubProjectV2ItemStoreService';
import { GitHubProjectV2Item } from '@shared/data/GitHubProjectV2Item';
import type { IProjectService } from './IProjectService';

const logger = getLogger('GitHubProjectV2SyncServiceImpl');

/**
 * GitHub ProjectV2・組織の同期サービス
 *
 * GitHubのProjectV2・組織をDBに保存する
 */
@injectable()
export class GitHubProjectV2SyncServiceImpl implements IGitHubProjectV2SyncService {
  constructor(
    @inject(TYPES.GitHubService)
    private readonly gitHubService: IGitHubService,
    @inject(TYPES.GitHubProjectV2StoreService)
    private readonly gitHubProjectV2StoreService: IGitHubProjectV2StoreService,
    @inject(TYPES.GitHubOrganizationStoreService)
    private readonly gitHubOrganizationStoreService: IGitHubOrganizationStoreService,
    @inject(TYPES.GitHubProjectV2ItemStoreService)
    private readonly gitHubProjectV2ItemStoreService: IGitHubProjectV2ItemStoreService,
    @inject(TYPES.ProjectService)
    private readonly projectService: IProjectService
  ) {}

  async syncProjectV2(): Promise<void> {
    const localOrgainzation = await this.gitHubOrganizationStoreService.list();
    const remotoGitHubProjectV2 = await this.gitHubService.fetchProjectsV2(localOrgainzation);
    const localGitHubProjectV2 = (
      await this.gitHubProjectV2StoreService.findByIds(
        remotoGitHubProjectV2.map((gitHubProjectV2) => gitHubProjectV2.id)
      )
    ).map((gitHubProjectV2) => gitHubProjectV2.id);

    for (const gitHubProjectV2 of remotoGitHubProjectV2) {
      if (!localGitHubProjectV2.includes(gitHubProjectV2.id)) {
        if (logger.isDebugEnabled()) logger.debug('not exists:', gitHubProjectV2);
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
        if (logger.isDebugEnabled()) logger.debug('not exists:', organization);
        await this.gitHubOrganizationStoreService.save(organization);
      }
    }
  }

  async syncProjectV2Item(minrProjectId: string): Promise<void> {
    const minrProject = await this.projectService.get(minrProjectId);
    if (!minrProject || !minrProject.gitHubProjectV2Id) {
      return;
    }
    const gitHubProjectV2 = await this.gitHubProjectV2StoreService.get(
      minrProject.gitHubProjectV2Id
    );
    if (!gitHubProjectV2) {
      return;
    }
    const remoteGitHubProjectV2Items = await this.gitHubService.fetchProjectV2Items(
      gitHubProjectV2
    );
    const localGitHubProjectV2Items = await this.gitHubProjectV2ItemStoreService.findByIds(
      remoteGitHubProjectV2Items.map((item) => item.id)
    );
    const itemIdMap = new Map(localGitHubProjectV2Items.map((item) => [item.id, item]));
    for (const item of remoteGitHubProjectV2Items) {
      const localItem = itemIdMap.get(item.id);
      let newItem: GitHubProjectV2Item;
      if (localItem) {
        const { title, projectId, description, fieldValues, url, created_at, updated_at } = item;
        newItem = {
          ...localItem,
          title,
          projectId,
          description,
          fieldValues,
          url,
          created_at,
          updated_at,
        };
      } else {
        newItem = item;
      }
      await this.gitHubProjectV2ItemStoreService.save(newItem);
    }
  }
}
