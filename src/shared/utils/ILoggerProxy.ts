export interface ILoggerProxy {
  info(id: string): Promise<void>;
  warn(id: string): Promise<void>;
  error(id: string): Promise<void>;
  debug(id: string): Promise<void>;
  isDebugEnabled(): Promise<boolean>;
}
