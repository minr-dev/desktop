export interface IWinstonLoggerProxy {
  setName(loggerName: string): Promise<void>;
  setProcessType(processType: string): Promise<void>;

  info(message: string): Promise<void>;
  warn(message: string): Promise<void>;
  error(message: string): Promise<void>;
  debug(message: string): Promise<void>;
  isDebugEnabled(): Promise<boolean>;
}

export interface WinstonSetting {
  loggerName: string;
  processType: string;
}
