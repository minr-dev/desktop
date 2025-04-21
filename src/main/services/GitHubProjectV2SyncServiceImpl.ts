import { inject, injectable } from 'inversify';
import { IGitHubProjectV2SyncService } from './IGitHubProjectV2SyncService';
import { TYPES } from '@main/types';
import type { IGitHubService } from './IGitHubService';
import type { IGitHubProjectV2StoreService } from './IGitHubProjectV2StoreService';
import type { IGitHubOrganizationStoreService } from './IGitHubOrganizationStoreService';
import { getLogger } from '@main/utils/LoggerUtil';

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
    private readonly gitHubOrganizationStoreService: IGitHubOrganizationStoreService
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
}
