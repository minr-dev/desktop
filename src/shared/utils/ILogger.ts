export interface ILogger {
  addFileTransport(filePath: string): void;
  info(message: string, processtype: string, loggername: string): void;
  warn(message: string, processtype: string, loggername: string): void;
  error(message: string, processtype: string, loggername: string): void;
  debug(message: string, processtype: string, loggername: string): void;
  isDebugEnabled(): boolean;
}
