/**
 * GitHub で管理されている組織
 */
export interface GitHubOrganization {
  /** GitHubで管理される、組織のID */
  id: string;
  /** GitHubの組織名 */
  login: string;
  /** GitHubの組織ページのURL */
  url: string;
  /** GitHub上での作成日時 */
  created_at: Date;
  /** GitHub上での更新日時 */
  updated_at: Date;
  minr_user_id: string;
}
