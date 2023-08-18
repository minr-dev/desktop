import { BrowserWindow } from 'electron';
import { injectable } from 'inversify';

@injectable()
export class IpcService {
  private window?: BrowserWindow;

  setWindow(window: BrowserWindow): void {
    this.window = window;
  }

  send(channel: string, ...args: unknown[]): void {
    if (!this.window) {
      throw new Error('Window not initialized');
    }
    this.window.webContents.send(channel, ...args);
  }
}
