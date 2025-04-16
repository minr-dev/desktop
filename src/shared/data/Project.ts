export interface Project {
  id: string;

  name: string;
  gitHubProjectV2Id?: string;
  description: string;
  gitHubProjectV2Id?: string | null;

  updated: Date;
}
