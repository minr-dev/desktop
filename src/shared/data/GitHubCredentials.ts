export interface GitHubCredentials {
  /** MINRのユーザーID */
  userId: string;

  /** GitHubで管理される、ユーザーのID */
  id: string;
  /** GitHubアカウントのユーザー名 */
  login: string;
  /** アクセストークン */
  accessToken: string;

  updated: Date;
}
