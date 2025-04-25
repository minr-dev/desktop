export interface Project {
  id: string;

  name: string;
  gitHubProjectV2Id?: string;
  description: string;

  updated: Date;
}
