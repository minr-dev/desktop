export interface IGitHubProjectV2SyncProxy {
  syncGitHubProjectV2(): Promise<void>;
  syncOrganization(): Promise<void>;
}
