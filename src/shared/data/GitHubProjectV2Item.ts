/**
 * GitHubEvent は、GitHub のアクティビティで取得されるイベントです。
 */
export interface GitHubProjectV2Item {
  id: string;
  title: string;
  projectId: string;
  description?: string | null;
  fieldValues: {
    id: string;
    name: string;
    [key: string]: unknown;
  }[];
  url?: string | null;
  created_at: Date;
  updated_at: Date;
  minr_user_id: string;
}
