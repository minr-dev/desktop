import { BrowserWindow } from 'electron';
import { IAuthService } from './IAuthService';
import axios from 'axios';
import { GithubCredentials } from '../../shared/dto/GithubCredentials';
import type { ICredentialsStoreService } from './ICredentialsStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import type { IUserDetailsService } from './IUserDetailsService';

interface GithubCredentialsApiResponse {
  id: string;
  access_token: string;
}

@injectable()
export class GithubAuthServiceImpl implements IAuthService {
  private redirectUrl = 'https://www.altus5.co.jp/callback';
  private authWindow?: BrowserWindow;

  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.GithubCredentialsStoreService)
    private readonly githubCredentialsService: ICredentialsStoreService<GithubCredentials>
  ) {}

  private async getUserId(): Promise<string> {
    const userDetails = await this.userDetailsService.get();
    return userDetails.userId;
  }

  private get minrServerUrl(): string {
    return process.env.MINR_SERVER_URL || DEFAULT_MINR_SERVER_URL;
  }

  private get backendUrl(): string {
    return `${this.minrServerUrl}/v1/github/auth`;
  }

  private get revokenUrl(): string {
    return `${this.minrServerUrl}/v1/github/revoke`;
  }

  async getAccessToken(): Promise<string | null> {
    console.log('main getAccessToken');
    const credentials = await this.githubCredentialsService.get(await this.getUserId());
    if (credentials) {
      return credentials.accessToken;
    }
    return null;
  }

  private async getAuthUrl(): Promise<string> {
    console.log(`get auth url: ${this.backendUrl}`);
    return this.backendUrl;
  }

  private async postAuthenticated(
    code: string,
    url: string
  ): Promise<GithubCredentialsApiResponse> {
    console.log(`post url: ${this.backendUrl} url: ${url} code: ${code}`);
    const response = await axios.post<GithubCredentialsApiResponse>(this.backendUrl, {
      code: code,
      url: url,
    });
    return response.data;
  }

  private async postRevoke(id: string): Promise<GithubCredentialsApiResponse> {
    console.log(`postRevoke: ${this.revokenUrl} id: ${id}`);
    const response = await axios.post<GithubCredentialsApiResponse>(this.revokenUrl, { id: id });
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

      this.authWindow.webContents.on('will-redirect', async (_event, url) => {
        // this.closeAuthWindow();
        // GithubからのリダイレクトURLから認証トークンを取り出します
        // 例えば、リダイレクトURLが "http://localhost:5000/callback?code=abcdef" の場合：
        console.log('callback url', url, this.redirectUrl);
        if (url.startsWith(this.redirectUrl)) {
          // event.preventDefault();
          const urlObj = new URL(url);
          const token = urlObj.searchParams.get('code');
          if (token) {
            console.log(`call postAuthenticated`);
            const apiCredentials = await this.postAuthenticated(token, url);
            console.log(`result postAuthenticated`, apiCredentials);
            const credentials: GithubCredentials = {
              userId: await this.getUserId(),
              id: apiCredentials.id,
              accessToken: apiCredentials.access_token,
              updated: new Date(),
            };
            await this.githubCredentialsService.save(credentials);
            resolve(token);
          } else {
            reject(new Error('No token found'));
          }
        }
      });
      this.authWindow.webContents.on('did-navigate', (_event, url) => {
        console.log('did-navigate url', url, this.redirectUrl);
        // リダイレクトURLが表示されたらウィンドウを閉じる
        if (url.startsWith(this.redirectUrl)) {
          this.closeAuthWindow();
        }
      });

      // windowが閉じられたかどうかを確認する
      // this.authWindow.on('closed', () => {
      //   reject(new Error('Window was closed by user'));
      // });
    });
  }

  async revoke(): Promise<void> {
    const credentials = await this.githubCredentialsService.get(await this.getUserId());
    if (credentials) {
      await this.githubCredentialsService.delete(await this.getUserId());
      await this.postRevoke(credentials.id);
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
