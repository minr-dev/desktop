export interface IWinstonLogger {
  setName(name: string): void;
  setProcessType(processType: string): void;
  setIsDebugEnabled(): void;

  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
  isDebugEnabled(): boolean;
}

export interface WinstonSetting {
  loggerName: string;
  processType: string;
  isDebugEnabled: boolean;
}
