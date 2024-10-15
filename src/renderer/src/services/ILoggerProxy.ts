export interface ILoggerProxy {
  // ロガー設定
  setName(name: string): Promise<void>;
  setIsDebugEnabled(): Promise<void>;

  // ログ出力
  info(message: string): Promise<void>;
  warn(message: string): Promise<void>;
  error(message: string): Promise<void>;
  debug(message: string): Promise<void>;
  isDebugEnabled(): boolean;
}
