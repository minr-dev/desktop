import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from 'electron';
import { IIpcInitializer } from './IIpcInitializer';
import { IAuthService } from './IAuthService';
import axios from 'axios';
import { GoogleCredentials } from '../../shared/dto/GoogleCredentials';
import { StoreGoogleCredentialsServiceImpl } from './StoreGoogleCredentialsServiceImpl';
import { IGoogleCredentialsService } from './IGoogleCredentialsService';

const TOKEN_REFRESH_INTERVAL = 1000 * 60 * 5;

export class GoogleAuthServiceImpl implements IAuthService, IIpcInitializer {
  private redirectUrl = 'https://www.altus5.co.jp/callback';
  private authWindow?: BrowserWindow;
  private storeGoogleCredentialsService: IGoogleCredentialsService;

  constructor() {
    this.storeGoogleCredentialsService = new StoreGoogleCredentialsServiceImpl();
  }

  init(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle('google-authenticate', async (_event: IpcMainInvokeEvent) => {
      console.log('ipcMain handle google-authenticate');
      return await this.authenticate();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle('google-getAccessToken', async (_event: IpcMainInvokeEvent) => {
      console.log('ipcMain handle google-getAccessToken');
      return await this.getAccessToken();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle('google-revoke', async (_event: IpcMainInvokeEvent) => {
      return await this.revoke();
    });
  }

  private get backendUrl(): string {
    return `${process.env.MINR_SERVER_URL}/google/auth`;
  }

  private get refreshTokenUrl(): string {
    return `${process.env.MINR_SERVER_URL}/google/refresh-token`;
  }

  private get revokenUrl(): string {
    return `${process.env.MINR_SERVER_URL}/google/revoke`;
  }

  async getAccessToken(): Promise<string | null> {
    console.log('main getAccessToken');
    let credentials = await this.storeGoogleCredentialsService.get();
    console.log({ credentials: credentials });
    if (credentials) {
      const expiry = new Date(credentials.expiry);
      console.log({
        now: Date.now(),
        expiry: expiry.getTime(),
      });
      const timedelta = Date.now() - expiry.getTime();
      if (timedelta < TOKEN_REFRESH_INTERVAL) {
        try {
          credentials = await this.fetchRefreshToken(credentials.sub);
          await this.storeGoogleCredentialsService.save(credentials);
        } catch (e) {
          console.log(e);
          await this.storeGoogleCredentialsService.delete();
          await this.postRevoke(credentials.sub);
          return null;
        }
      }
      return credentials.access_token;
    }
    return null;
  }

  private async fetchAuthUrl(): Promise<string> {
    console.log(`fetching auth url: ${this.backendUrl}`);
    const response = await axios.get<{ url: string }>(this.backendUrl);
    return response.data.url;
  }

  private async postAuthenticated(code: string, url: string): Promise<GoogleCredentials> {
    console.log(`post url: ${this.backendUrl} url: ${url} code: ${code}`);
    const response = await axios.post<GoogleCredentials>(this.backendUrl, { code: code, url: url });
    return response.data;
  }

  private async fetchRefreshToken(sub: string): Promise<GoogleCredentials> {
    const response = await axios.post<GoogleCredentials>(this.refreshTokenUrl, { sub: sub });
    return response.data;
  }

  private async postRevoke(sub: string): Promise<GoogleCredentials> {
    const response = await axios.post<GoogleCredentials>(this.revokenUrl, { sub: sub });
    return response.data;
  }

  async authenticate(): Promise<string> {
    console.log(`authenticate`);
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

      this.authWindow.webContents.on('will-redirect', async (event, url) => {
        // this.closeAuthWindow();
        // GoogleからのリダイレクトURLから認証トークンを取り出します
        // 例えば、リダイレクトURLが "http://localhost:5000/callback?code=abcdef" の場合：
        if (url.startsWith(this.redirectUrl)) {
          event.preventDefault();
          const urlObj = new URL(url);
          const token = urlObj.searchParams.get('code');
          if (token) {
            console.log(`call postAuthenticated`);
            const credentials = await this.postAuthenticated(token, url);
            console.log(`result postAuthenticated`, credentials);
            await this.storeGoogleCredentialsService.save(credentials);
            resolve(token);
          } else {
            reject(new Error('No token found'));
          }
          this.closeAuthWindow();
        }
      });

      // windowが閉じられたかどうかを確認する
      this.authWindow.on('closed', () => {
        reject(new Error('Window was closed by user'));
      });
    });
  }

  async revoke(): Promise<void> {
    const credentials = await this.storeGoogleCredentialsService.get();
    if (credentials) {
      await this.storeGoogleCredentialsService.delete();
      await this.postRevoke(credentials.sub);
    }
  }

  private closeAuthWindow(): void {
    if (this.authWindow) {
      try {
        this.authWindow.close();
      } catch (e) {
        console.log(e);
      }
      this.authWindow = undefined;
    }
  }
}
