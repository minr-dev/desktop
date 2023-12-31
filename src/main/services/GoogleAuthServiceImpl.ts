import { BrowserWindow } from 'electron';
import { IAuthService } from './IAuthService';
import axios from 'axios';
import { GoogleCredentials } from '../../shared/data/GoogleCredentials';
import type { ICredentialsStoreService } from './ICredentialsStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import type { IUserDetailsService } from './IUserDetailsService';
const TOKEN_REFRESH_INTERVAL = 1000 * 60 * 5;

interface GoogleCredentialsApiResponse {
  sub: string;
  access_token: string;
  expiry: string;
}

@injectable()
export class GoogleAuthServiceImpl implements IAuthService {
  private redirectUrl = 'https://www.altus5.co.jp/callback';
  private authWindow?: BrowserWindow;

  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.GoogleCredentialsStoreService)
    private readonly googleCredentialsService: ICredentialsStoreService<GoogleCredentials>
  ) {}

  private async getUserId(): Promise<string> {
    const userDetails = await this.userDetailsService.get();
    return userDetails.userId;
  }

  private get minrServerUrl(): string {
    return process.env.MINR_SERVER_URL || DEFAULT_MINR_SERVER_URL;
  }

  private get backendUrl(): string {
    return `${this.minrServerUrl}/v1/google/auth`;
  }

  private get refreshTokenUrl(): string {
    return `${this.minrServerUrl}/v1/google/refresh-token`;
  }

  private get revokenUrl(): string {
    return `${this.minrServerUrl}/v1/google/revoke`;
  }

  async getAccessToken(): Promise<string | null> {
    console.log('main getAccessToken');
    const credentials = await this.googleCredentialsService.get(await this.getUserId());
    console.log({ credentials: credentials });
    if (credentials) {
      const expiry = new Date(credentials.expiry);
      const timedelta = expiry.getTime() - Date.now();
      console.log({
        now: Date.now(),
        expiry: expiry.getTime(),
        timedelta: timedelta,
      });
      if (timedelta < TOKEN_REFRESH_INTERVAL) {
        console.log('expired!', {
          timedelta: timedelta,
        });
        try {
          const apiCredentials = await this.fetchRefreshToken(credentials.sub);
          credentials.accessToken = apiCredentials.access_token;
          credentials.expiry = apiCredentials.expiry;
          await this.googleCredentialsService.save(credentials);
        } catch (e) {
          console.log(e);
          await this.googleCredentialsService.delete(await this.getUserId());
          await this.postRevoke(credentials.sub);
          return null;
        }
      } else {
        console.log('not expired');
      }
      return credentials.accessToken;
    }
    return null;
  }

  private async getAuthUrl(): Promise<string> {
    console.log(`fetching auth url: ${this.backendUrl}`);
    return this.backendUrl;
  }

  private async postAuthenticated(
    code: string,
    url: string
  ): Promise<GoogleCredentialsApiResponse> {
    console.log(`post url: ${this.backendUrl} url: ${url} code: ${code}`);
    const response = await axios.post<GoogleCredentialsApiResponse>(this.backendUrl, {
      code: code,
      url: url,
    });
    return response.data;
  }

  private async fetchRefreshToken(sub: string): Promise<GoogleCredentialsApiResponse> {
    console.log(`fetchRefreshToken ${this.refreshTokenUrl} sub: ${sub}`);
    const response = await axios.post<GoogleCredentialsApiResponse>(this.refreshTokenUrl, {
      sub: sub,
    });
    return response.data;
  }

  private async postRevoke(sub: string): Promise<GoogleCredentialsApiResponse> {
    console.log(`postRevoke: ${this.revokenUrl} sub: ${sub}`);
    const response = await axios.post<GoogleCredentialsApiResponse>(this.revokenUrl, { sub: sub });
    return response.data;
  }

  async authenticate(): Promise<string> {
    console.log(`authenticate`);
    const accessToken = await this.getAccessToken();
    if (accessToken) {
      return accessToken;
    }

    const url = await this.getAuthUrl();
    return new Promise((resolve, reject) => {
      this.closeAuthWindow();

      this.authWindow = new BrowserWindow({
        width: 612,
        height: 850,
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
            const apiCredentials = await this.postAuthenticated(token, url);
            console.log(`result postAuthenticated`, apiCredentials);
            const credentials: GoogleCredentials = {
              userId: await this.getUserId(),
              sub: apiCredentials.sub,
              accessToken: apiCredentials.access_token,
              expiry: apiCredentials.expiry,
              updated: new Date(),
            };
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
    const credentials = await this.googleCredentialsService.get(await this.getUserId());
    if (credentials) {
      await this.googleCredentialsService.delete(await this.getUserId());
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
