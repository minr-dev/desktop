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
  name: string;
  dataType: T;
  value: GitHubProjectV2FieldTypeMap[T];
}

export type GitHubProjectV2Field = {
  [T in GitHubProjectV2FieldType]: GitHubProjectV2FieldOf<T>;
}[GitHubProjectV2FieldType];

/**
 * GitHub のプロジェクト内に置かれた、Issue、DraftIssue、PullRequestのデータ
 */
export interface GitHubProjectV2Item {
  id: string;
  title: string;
  // GitHubのProjectV2のID
  projectId: string;
  description?: string | null;
  fieldValues: GitHubProjectV2Field[];
  url?: string | null;
  created_at: Date;
  updated_at: Date;
  minr_user_id: string;
}
