/**
 * GitHubにおけるフィールドの型と、Minrで保存するフィールド値の型のマッピング
 */
type GitHubProjectV2FieldTypeMap = {
  DATE?: Date | null;
  ITERATION: {
    startDay: number;
    duration: number;
  };
  NUMBER?: number | null;
  SINGLE_SELECT?: string | null;
  TEXT?: string | null;
  TITLE?: string | null;
};

export type GitHubProjectV2FieldType = keyof GitHubProjectV2FieldTypeMap;

export const GitHubProjectV2FieldType: { [K in GitHubProjectV2FieldType]: K } = {
  DATE: 'DATE',
  ITERATION: 'ITERATION',
  NUMBER: 'NUMBER',
  SINGLE_SELECT: 'SINGLE_SELECT',
  TEXT: 'TEXT',
  TITLE: 'TITLE',
};

export interface GitHubProjectV2FieldOf<
  T extends GitHubProjectV2FieldType = GitHubProjectV2FieldType
> {
  /** フィールド名 */
  name: string;
  /** フィールドの型 */
  dataType: T;
  /** フィールドの値 */
  value: GitHubProjectV2FieldTypeMap[T];
}

export type GitHubProjectV2Field = {
  [T in GitHubProjectV2FieldType]: GitHubProjectV2FieldOf<T>;
}[GitHubProjectV2FieldType];

/**
 * GitHub のプロジェクト内に置かれた、Issue、DraftIssue、PullRequestのデータ
 */
export interface GitHubProjectV2Item {
  /** GitHubで管理されるプロジェクトアイテムのID */
  id: string;
  /** プロジェクトアイテムのタイトル */
  title: string;
  /** プロジェクトアイテムが属するプロジェクトのID */
  projectId: string;
  /** プロジェクトアイテムの説明 */
  description?: string | null;
  /** ステータスなどのプロジェクトで管理されるフィールドの値 */
  fieldValues: GitHubProjectV2Field[];
  /** Issue、PullRequestのURL */
  url?: string | null;
  /** GitHub上での作成日時 */
  created_at: Date;
  /** GitHub上での更新日時 */
  updated_at: Date;
  minr_user_id: string;
}
