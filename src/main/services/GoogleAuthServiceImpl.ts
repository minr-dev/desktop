import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from 'electron';
import { IIpcInitializer } from './IIpcInitializer';
import { IAuthService } from './IAuthService';
import axios from 'axios';
import { GoogleCredentials } from '../../shared/dto/GoogleCredentials';
import { StoreGoogleCredentialsServiceImpl } from './StoreGoogleCredentialsServiceImpl';
import { IGoogleCredentialsService } from './IGoogleCredentialsService';

const TOKEN_REFRESH_INTERVAL = 1000 * 60 * 60;

export class GoogleAuthServiceImpl implements IAuthService, IIpcInitializer {
  private redirectUrl = 'http://localhost/callback';
  private authWindow?: BrowserWindow;

  constructor(private storeGoogleCredentialsService?: IGoogleCredentialsService) {
    if (!storeGoogleCredentialsService) {
      this.storeGoogleCredentialsService = new StoreGoogleCredentialsServiceImpl();
    }
  }

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle('google-authenticate', async (_event: IpcMainInvokeEvent) => {
      return await this.authenticate();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle('google-getAccessToken', async (_event: IpcMainInvokeEvent) => {
      return await this.getAccessToken();
    });
  }

  private get backendUrl(): string {
    return `${process.env.MINR_SERVER_URL}/google-auth`;
  }

  private get refreshTokenUrl(): string {
    return `${process.env.MINR_SERVER_URL}/refresh-token`;
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.storeGoogleCredentialsService) {
      throw new Error('storeGoogleCredentialsService is not initialized');
    }
    let credentials = await this.storeGoogleCredentialsService.get();
    if (credentials) {
      const expiry = new Date(credentials.expiry);
      const timedelta = expiry.getTime() - Date.now();
      if (timedelta < TOKEN_REFRESH_INTERVAL) {
        credentials = await this.fetchRefreshToken(credentials.sub);
        await this.storeGoogleCredentialsService.save(credentials);
      }
      return credentials.access_token;
    }
    return null;
  }

  async fetchAuthUrl(): Promise<string> {
    console.log(`fetching auth url: ${this.backendUrl}`);
    const response = await axios.get<{ url: string }>(this.backendUrl);
    return response.data.url;
  }

  async fetchGoogleCredentials(code: string): Promise<GoogleCredentials> {
    const response = await axios.post<GoogleCredentials>(this.backendUrl, { code: code });
    return response.data;
  }

  async fetchRefreshToken(sub: string): Promise<GoogleCredentials> {
    const response = await axios.post<GoogleCredentials>(this.refreshTokenUrl, { sub: sub });
    return response.data;
  }

  async authenticate(): Promise<string> {
    if (!this.storeGoogleCredentialsService) {
      throw new Error('storeGoogleCredentialsService is not initialized');
    }
    const accessToken = await this.getAccessToken();
    if (accessToken) {
      return accessToken;
    }

    const url = await this.fetchAuthUrl();
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
        // 例えば、リダイレクトURLが "http://localhost:5000/callback?code=abcdef" の場合：
        if (url.startsWith(this.redirectUrl)) {
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
