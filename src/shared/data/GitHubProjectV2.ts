/**
 * GitHub で管理されるプロジェクト。
 */
export interface GitHubProjectV2 {
  id: string;
  title: string;
  number: number;
  owner: string;
  readme?: string | null;
  url: string;
  created_at: Date;
  updated_at: Date;
  minr_user_id: string;
}
