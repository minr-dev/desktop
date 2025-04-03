/**
 * GitHubEvent は、GitHub のアクティビティで取得されるイベントです。
 */
export interface GitHubOrganization {
  id: string;
  login: string;
  url: string;
  created_at: Date;
  updated_at: Date;
  minr_user_id: string;
}
