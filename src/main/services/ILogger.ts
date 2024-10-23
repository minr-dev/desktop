export interface ILogger {
  // ロガーの設定
  setName(name: string): void;
  setProcessType(processType: PROCESS_TYPE): void;

  // ログ出力
  info(message: unknown, ...meta: unknown[]): void;
  warn(message: unknown, ...meta: unknown[]): void;
  error(message: unknown, ...meta: unknown[]): void;
  debug(message: unknown, ...meta: unknown[]): void;
  isDebugEnabled(): boolean;
}

export const PROCESS_TYPE = {
  MAIN: 'main',
  RENDERER: 'renderer',
} as const;
export type PROCESS_TYPE = (typeof PROCESS_TYPE)[keyof typeof PROCESS_TYPE];
