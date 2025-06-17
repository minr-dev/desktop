import { BrowserWindow } from 'electron';
import { injectable } from 'inversify';

@injectable()
export class IpcService {
  private window: BrowserWindow | null = null;

  hasValidWindow(): boolean {
    return this.window == null || !this.window.isDestroyed();
  }

  setWindow(window: BrowserWindow | null): void {
    this.window = window;
  }

  send(channel: string, ...args: unknown[]): void {
    if (!this.window) {
      throw new Error('Window not initialized');
    }
    if (this.hasValidWindow()) {
      this.window.webContents.send(channel, ...args);
    }
  }
}
