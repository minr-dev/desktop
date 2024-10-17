export interface ILogger {
  // ロガーの設定
  setName(name: string): void;
  setProcessType(processType: string): void;

  // ログ出力
  info(message: unknown, ...meta: unknown[]): void;
  warn(message: unknown, ...meta: unknown[]): void;
  error(message: unknown, ...meta: unknown[]): void;
  debug(message: unknown, ...meta: unknown[]): void;
  isDebugEnabled(): boolean;
}
