export interface ILoggerProxy {
  // ロガー設定
  setName(name: string): Promise<void>;
  setIsDebugEnabled(): Promise<void>;

  // ログ出力
  info(message: unknown, ...meta: unknown[]): Promise<void>;
  warn(message: unknown, ...meta: unknown[]): Promise<void>;
  error(message: unknown, ...meta: unknown[]): Promise<void>;
  debug(message: unknown, ...meta: unknown[]): Promise<void>;
  isDebugEnabled(): boolean;
}
