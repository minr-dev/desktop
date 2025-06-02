export interface IGitHubTaskSyncService {
  syncGitHubProjectV2Item(minrProjectId: string): Promise<void>;
}
