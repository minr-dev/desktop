export interface IGitHubTaskSyncProxy {
  syncGitHubProjectV2Item(minrProjectId: string): Promise<void>;
}
