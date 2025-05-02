export interface Project {
  id: string;

  name: string;
  gitHubProjectV2Id?: string | null;
  description: string;

  updated: Date;
}
