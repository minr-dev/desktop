import { injectable } from 'inversify';
import { IGitHubProjectV2SyncService } from './IGitHubProjectV2SyncService';

@injectable()
export class GitHubProjectV2SyncServiceImpl implements IGitHubProjectV2SyncService {
  constructor() {}

  async syncProjectV2(): Promise<void> {}

  async syncOrganization(): Promise<void> {}
}
