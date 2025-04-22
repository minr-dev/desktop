import { inject, injectable } from 'inversify';
import { IGitHubProjectV2SyncService } from './IGitHubProjectV2SyncService';
import { TYPES } from '@main/types';
import type { IGitHubService } from './IGitHubService';
import type { IGitHubProjectV2StoreService } from './IGitHubProjectV2StoreService';
import type { IGitHubOrganizationStoreService } from './IGitHubOrganizationStoreService';
import { getLogger } from '@main/utils/LoggerUtil';
import type { IGitHubProjectV2ItemStoreService } from './IGitHubProjectV2ItemStoreService';
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

  async syncGitHubProjectV2(): Promise<void> {
    if (logger.isDebugEnabled()) logger.debug('sync GitHubProjectV2.');
    // memo: 既に保存されているGitHubProjectV2を全て削除し、GitHubから取得したデータのみをローカルに配置する。
    await this.gitHubProjectV2StoreService.bulkDelete(
      (await this.gitHubProjectV2StoreService.list()).map((gitHubProjectV2) => gitHubProjectV2.id)
    );

    const localOrgainzation = await this.gitHubOrganizationStoreService.list();
    const remotoGitHubProjectV2 = await this.gitHubService.fetchProjectsV2(localOrgainzation);
    for (const gitHubProjectV2 of remotoGitHubProjectV2) {
      await this.gitHubProjectV2StoreService.save(gitHubProjectV2);
    }
  }

  async syncOrganization(): Promise<void> {
    if (logger.isDebugEnabled()) logger.debug('sync Organization.');
    // memo: 既に保存されているOrganizationを全て削除し、GitHubから取得したデータのみをローカルに配置する。
    await this.gitHubOrganizationStoreService.bulkDelete(
      (await this.gitHubOrganizationStoreService.list()).map((organization) => organization.id)
    );
    const remotoOrganization = await this.gitHubService.fetchOrganizations();

    for (const organization of remotoOrganization) {
      await this.gitHubOrganizationStoreService.save(organization);
    }
  }

  async syncProjectV2Item(minrProjectId: string): Promise<void> {
    if (logger.isDebugEnabled()) logger.debug('sync ProjectV2Item');
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
    const localGitHubProjectV2Items = await this.gitHubProjectV2ItemStoreService.list(
      gitHubProjectV2.id
    );
    // memo: 既に保存されているOrganizationを全て削除し、GitHubから取得したデータのみをローカルに配置する。
    await this.gitHubProjectV2ItemStoreService.bulkDelete(
      localGitHubProjectV2Items.map((item) => item.id)
    );
    const remoteGitHubProjectV2Items = await this.gitHubService.fetchProjectV2Items(
      gitHubProjectV2
    );
    await Promise.all(
      remoteGitHubProjectV2Items.map((item) => this.gitHubProjectV2ItemStoreService.save(item))
    );
  }
}
