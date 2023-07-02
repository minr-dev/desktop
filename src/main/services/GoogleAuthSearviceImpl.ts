import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from 'electron';
import { IIpcInitializer } from './IIpcInitializer';
import { IAuthService } from './IAuthService';

export class GoogleAuthSearviceImpl implements IAuthService, IIpcInitializer {
  private backendUrl = 'http://localhost:5000';
  private authWindow?: BrowserWindow;

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle('google-auth', async (_event: IpcMainInvokeEvent) => {
      return await this.authenticate();
    });
  }

  async authenticate(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.closeAuthWindow();

      const authUrl = `${this.backendUrl}/auth/google`;
      this.authWindow = new BrowserWindow({
        width: 500,
        height: 600,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      this.authWindow.loadURL(authUrl);
      this.authWindow.show();

      this.authWindow.webContents.on('will-redirect', (event, url) => {
        this.closeAuthWindow();
        // GoogleからのリダイレクトURLから認証トークンを取り出します
        // 例えば、リダイレクトURLが "http://localhost:5000/callback#token=abcdef" の場合：
        if (url.startsWith(`${this.backendUrl}/callback`)) {
          event.preventDefault();
          const token = new URL(url).hash.split('=')[1];
          if (token) {
            resolve(token);
          } else {
            reject(new Error('No token found'));
          }
        }
      });

      // windowが閉じられたかどうかを確認する
      this.authWindow.on('closed', () => {
        reject(new Error('Window was closed by user'));
      });
    });
  }

  closeAuthWindow(): void {
    if (this.authWindow) {
      this.authWindow.close();
      this.authWindow = undefined;
    }
  }
}
