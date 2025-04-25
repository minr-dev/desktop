export interface IGitHubProjectV2SyncService {
  syncGitHubProjectV2(): Promise<void>;
  syncOrganization(): Promise<void>;
}
