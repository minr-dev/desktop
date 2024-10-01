import { TYPES } from '@main/types';
import { BrowserWindow } from 'electron';
import { inject, injectable } from 'inversify';
import type { ILoggerFactory } from './ILoggerFactory';

@injectable()
export class IpcService {
  private window?: BrowserWindow;
  private logger;

  constructor(
    @inject(TYPES.LoggerFactory)
    private readonly loggerFactory: ILoggerFactory
  ) {
    this.logger = this.loggerFactory.getLogger({
      processType: 'main',
      loggerName: 'IpcService',
    });
  }

  setWindow(window: BrowserWindow): void {
    this.window = window;
  }

  send(channel: string, ...args: unknown[]): void {
    if (!this.window) {
      this.logger.error('Window not initialized');
      throw new Error('Window not initialized');
    }
    this.window.webContents.send(channel, ...args);
  }
}
