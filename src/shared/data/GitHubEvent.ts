/**
 * GitHubEvent は、GitHub のアクティビティで取得されるイベントです。
 */
export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
  };
  repo: {
    id: number;
    name: string;
  };
  payload: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
  minr_user_id: string;
}
