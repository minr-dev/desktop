import { BrowserWindow } from 'electron';
import { IAuthService } from './IAuthService';
import axios from 'axios';
import { GitHubCredentials } from '../../shared/data/GitHubCredentials';
import type { ICredentialsStoreService } from './ICredentialsStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import type { IUserDetailsService } from './IUserDetailsService';
import type { ILoggerFactory } from './ILoggerFactory';

interface GitHubCredentialsApiResponse {
  id: string;
  login: string;
  access_token: string;
}

/**
 * GitHub認証を実行するサービス
 *
 * OAuthアプリのクライアントIDとクライアントシークレットをデスクトップアプリに実装すると、
 * リバースエンジニアリングで簡単に解析できてしまうので、 minr server 側に実装していて、
 * GitHubの認証用の画面（URL）を取得して表示し、GitHubでの認証実行後にOAuthアプリに設定されている
 * コールバックURLにリダイレクトされたことを検出して minr server にコールバックURLに含まれる
 * 認証コードをminr server 側に post して、GitHub と照合して、アクセストークンを取得する。
 * アクセストークンは、 minr server にも保存されるがローカルにも保存して、以降はアクセストークンだけで、
 * GitHub と直接通信する。
 */
@injectable()
export class GitHubAuthServiceImpl implements IAuthService {
  private redirectUrl = 'https://www.altus5.co.jp/callback';
  private authWindow?: BrowserWindow;
  private logger;

  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.GitHubCredentialsStoreService)
    private readonly githubCredentialsService: ICredentialsStoreService<GitHubCredentials>,
    @inject(TYPES.LoggerFactory)
    private readonly loggerFactory: ILoggerFactory
  ) {
    this.logger = this.loggerFactory.getLogger({
      processType: 'main',
      loggerName: 'GitHubAuthServiceImpl',
    });
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
    this.logger.info('main getAccessToken');
    const credentials = await this.githubCredentialsService.get(
      await this.userDetailsService.getUserId()
    );
    if (credentials) {
      return credentials.accessToken;
    }
    return null;
  }

  private async getAuthUrl(): Promise<string> {
    this.logger.info(`get auth url: ${this.backendUrl}`);
    return this.backendUrl;
  }

  private async postAuthenticated(
    code: string,
    url: string
  ): Promise<GitHubCredentialsApiResponse> {
    this.logger.info(`backendUrl=${this.backendUrl}, url=${url}, code=${code}`);
    const response = await axios.post<GitHubCredentialsApiResponse>(this.backendUrl, {
      code: code,
      url: url,
    });
    return response.data;
  }

  private async postRevoke(id: string): Promise<GitHubCredentialsApiResponse> {
    this.logger.info(`postRevoke: revokenUrl=${this.revokenUrl}, id=${id}`);
    const response = await axios.post<GitHubCredentialsApiResponse>(this.revokenUrl, { id: id });
    return response.data;
  }

  async authenticate(): Promise<string> {
    this.logger.info(`authenticate`);
    const accessToken = await this.getAccessToken();
    if (accessToken) {
      return accessToken;
    }

    const url = await this.getAuthUrl();
    return new Promise((resolve, reject) => {
      this.closeAuthWindow();

      const handleCallback = async (url: string): Promise<void> => {
        // this.closeAuthWindow();
        // GitHubからのリダイレクトURLから認証トークンを取り出します
        // 例えば、リダイレクトURLが "http://localhost:5000/callback?code=abcdef" の場合：
        this.logger.info(`callback url: url=${url}, redirectUrl=${this.redirectUrl}`);
        if (url.startsWith(this.redirectUrl)) {
          // event.preventDefault();
          const urlObj = new URL(url);
          const token = urlObj.searchParams.get('code');
          if (token) {
            this.logger.info(`call postAuthenticated`);
            const apiCredentials = await this.postAuthenticated(token, url);
            this.logger.info(`result postAuthenticated: ${apiCredentials}`);
            const credentials: GitHubCredentials = {
              userId: await this.userDetailsService.getUserId(),
              id: apiCredentials.id,
              login: apiCredentials.login,
              accessToken: apiCredentials.access_token,
              updated: new Date(),
            };
            await this.githubCredentialsService.save(credentials);
            resolve(token);
          } else {
            reject(new Error('No token found'));
          }
        }
      };

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
        handleCallback(url).catch((err) => {
          this.logger.error(`An error occurred: ${err}`);
        });
      });
      this.authWindow.webContents.on('did-navigate', (_event, url) => {
        this.logger.info(`did-navigate url: url=${url}, redirectUrl=${this.redirectUrl}`);
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
    const uid = await this.userDetailsService.getUserId();
    const credentials = await this.githubCredentialsService.get(uid);
    if (credentials) {
      await this.githubCredentialsService.delete(uid);
      await this.postRevoke(credentials.id);
    }
  }

  private closeAuthWindow(): void {
    if (this.authWindow) {
      try {
        this.authWindow.close();
      } catch (e) {
        this.logger.error(`${e}`);
      }
      this.authWindow = undefined;
    }
  }
}
