export interface ILogger<T> {
  info(logData: T): void;
  warn(logData: T): void;
  error(logData: T): void;
  debug(logData: T): void;
  isDebugEnabled(): boolean;
}
