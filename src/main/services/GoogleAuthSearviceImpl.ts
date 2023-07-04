import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from 'electron';
import { IIpcInitializer } from './IIpcInitializer';
import { IAuthService } from './IAuthService';
import axios from 'axios';

export class GoogleAuthSearviceImpl implements IAuthService, IIpcInitializer {
  private backendUrl = 'http://localhost';
  private authWindow?: BrowserWindow;

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle('google-auth', async (_event: IpcMainInvokeEvent) => {
      return await this.authenticate();
    });
  }

  async fetchAuthUrl(): Promise<string> {
    // AWS LambdaのエンドポイントにGETリクエストを送信
    const response = await axios.get<{ url: string }>('http://127.0.0.1:5000/google-auth');
    return response.data.url;
  }

  async authenticate(): Promise<string> {
    const url = await this.fetchAuthUrl();
    console.log('url', url);

    return new Promise((resolve, reject) => {
      this.closeAuthWindow();

      this.authWindow = new BrowserWindow({
        width: 500,
        height: 600,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      this.authWindow.loadURL(url);
      this.authWindow.show();

      this.authWindow.webContents.on('will-redirect', (event, url) => {
        // this.closeAuthWindow();
        // GoogleからのリダイレクトURLから認証トークンを取り出します
        // 例えば、リダイレクトURLが "http://localhost:5000/callback#token=abcdef" の場合：
        console.log('will-redirect-url', url);
        if (url.startsWith(`${this.backendUrl}/callback`)) {
          event.preventDefault();
          const urlObj = new URL(url);
          const token = urlObj.searchParams.get('code');
          this.closeAuthWindow();
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
