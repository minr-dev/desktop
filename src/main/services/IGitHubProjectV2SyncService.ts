export interface IGitHubProjectV2SyncService {
  syncProjectV2(): Promise<void>;
  syncOrganization(): Promise<void>;
  syncProjectV2Item(projectId: string): Promise<void>;
}
