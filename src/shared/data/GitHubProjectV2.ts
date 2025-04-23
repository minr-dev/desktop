/**
 * GitHub で管理されるプロジェクト
 */
export interface GitHubProjectV2 {
  /** GitHubで管理されるプロジェクトのID */
  id: string;
  /** プロジェクト名 */
  title: string;
  /** 組織・ユーザー内における、プロジェクトの番号 */
  number: number;
  /** プロジェクトが紐づく組織のID */
  ownerId: string;
  /** プロジェクトのREADME */
  readme?: string | null;
  /** プロジェクトのURL */
  url: string;
  /** GitHub上での作成日時 */
  created_at: Date;
  /** GitHub上での更新日時 */
  updated_at: Date;
  minr_user_id: string;
}
