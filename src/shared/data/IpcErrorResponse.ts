/**
 * IpcErrorResponse
 * IPC 操作でエラーが発生したときのレスポンス。
 * @field error - エラーが発生したかどうか。
 * @field errorCode - エラーコード。エラーが発生した場合に設定される。
 * @field errorMessage - エラーの原因。エラーが発生した場合に設定される。
 */
export interface IpcErrorResponse {
  error: boolean;
  errorCode?: string;
  errorMessage?: string;
}
