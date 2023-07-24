import { BrowserWindow } from 'electron';
import { IAuthService } from './IAuthService';
import axios from 'axios';
import { Credentials } from '../../shared/dto/Credentials';
import type { ICredentialsStoreService } from './ICredentialsStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';

const TOKEN_REFRESH_INTERVAL = 1000 * 60 * 5;

@injectable()
export class GoogleAuthServiceImpl implements IAuthService {
  private redirectUrl = 'https://www.altus5.co.jp/callback';
  private authWindow?: BrowserWindow;

  constructor(
    @inject(TYPES.CredentialsStoreService)
    private readonly googleCredentialsService: ICredentialsStoreService
  ) {}

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
    let credentials = await this.googleCredentialsService.get();
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
          await this.googleCredentialsService.save(credentials);
        } catch (e) {
          console.log(e);
          await this.googleCredentialsService.delete();
          await this.postRevoke(credentials.sub);
          return null;
        }
      }
      return credentials.accessToken;
    }
    return null;
  }

  private async fetchAuthUrl(): Promise<string> {
    console.log(`fetching auth url: ${this.backendUrl}`);
    const response = await axios.get<{ url: string }>(this.backendUrl);
    return response.data.url;
  }

  private async postAuthenticated(code: string, url: string): Promise<Credentials> {
    console.log(`post url: ${this.backendUrl} url: ${url} code: ${code}`);
    const response = await axios.post<Credentials>(this.backendUrl, { code: code, url: url });
    return response.data;
  }

  private async fetchRefreshToken(sub: string): Promise<Credentials> {
    const response = await axios.post<Credentials>(this.refreshTokenUrl, { sub: sub });
    return response.data;
  }

  private async postRevoke(sub: string): Promise<Credentials> {
    const response = await axios.post<Credentials>(this.revokenUrl, { sub: sub });
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
            await this.googleCredentialsService.save(credentials);
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
    const credentials = await this.googleCredentialsService.get();
    if (credentials) {
      await this.googleCredentialsService.delete();
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
