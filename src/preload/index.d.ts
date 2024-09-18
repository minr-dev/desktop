import { ElectronAPI } from '@electron-toolkit/preload';

interface loggerPath {
  get(): string;
}

interface Logger {
  addFileTransport(filePath: string): void;
  info(message: string, processtype: string, loggername: string): void;
  warn(message: string, processtype: string, loggername: string): void;
  error(message: string, processtype: string, loggername: string): void;
  debug(message: string, processtype: string, loggername: string): void;
  isDebugEnabled(): boolean;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
    loggerPath: loggerPath;
    logger: Logger;
  }
}
