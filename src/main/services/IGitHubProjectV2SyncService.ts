export interface IGitHubProjectV2SyncService {
  syncProjectV2(): Promise<void>;
  syncOrganization(): Promise<void>;
}
