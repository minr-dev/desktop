export interface IGitHubProjectV2SyncProxy {
  syncGitHubProjectV2(): Promise<void>;
  syncOrganization(): Promise<void>;
  syncGitHubProjectV2Item(projectId: string): Promise<void>;
}
