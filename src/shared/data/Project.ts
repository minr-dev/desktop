export interface Project {
  id: string;

  name: string;
  description: string;
  gitHubProjectV2Id?: string | null;

  updated: Date;
}
