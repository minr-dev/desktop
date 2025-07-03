import { BrowserWindow } from 'electron';
import { injectable } from 'inversify';

@injectable()
export class IpcService {
  private window: BrowserWindow | null = null;

  hasValidWindow(): boolean {
    return this.isValidWindow(this.window);
  }

  setWindow(window: BrowserWindow | null): void {
    this.window = window;
  }

  send(channel: string, ...args: unknown[]): boolean {
    if (!this.isValidWindow(this.window)) {
      return false;
    }
    this.window.webContents.send(channel, ...args);
    return true;
  }

  private isValidWindow(window: BrowserWindow | null): window is BrowserWindow {
    return window != null && !window.isDestroyed();
  }
}
