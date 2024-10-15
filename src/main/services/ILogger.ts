export interface ILogger {
  // ロガーの設定
  setName(name: string): void;
  setProcessType(processType: string): void;

  // ログ出力
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
  isDebugEnabled(): boolean;
}
