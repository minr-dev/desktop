import { BrowserWindow } from 'electron';
import { IAuthService } from './IAuthService';
import { GoogleCredentials } from '../../shared/data/GoogleCredentials';
import type { ICredentialsStoreService } from './ICredentialsStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import type { IUserDetailsService } from './IUserDetailsService';
import { BaseClient, generators, Issuer, OpenIDCallbackChecks } from 'openid-client';
import { DateUtil } from '@shared/utils/DateUtil';
import { getLogger } from '@main/utils/LoggerUtil';

const TOKEN_REFRESH_INTERVAL = 1000 * 60 * 5;

const logger = getLogger('GoogleAuthServiceImpl');

@injectable()
export class GoogleAuthServiceImpl implements IAuthService {
  private authWindow?: BrowserWindow;
  private _client?: BaseClient;

  private authServerURL = 'https://accounts.google.com';
  private scope = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.GoogleCredentialsStoreService)
    private readonly googleCredentialsService: ICredentialsStoreService<GoogleCredentials>,
    @inject(TYPES.DateUtil)
    private readonly dateUtil: DateUtil
  ) {}

  private async getUserId(): Promise<string> {
    const userDetails = await this.userDetailsService.get();
    return userDetails.userId;
  }

  private get clientId(): string {
    return process.env.GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID;
  }
  private get redirectUri(): string {
    return process.env.GOOGLE_REDIRECT_URI || GOOGLE_REDIRECT_URI;
  }

  private async getClient(): Promise<BaseClient> {
    if (this._client != null) {
      return this._client;
    }
    const issuer = await Issuer.discover(this.authServerURL);

    this._client = new issuer.Client({
      client_id: this.clientId,
      redirect_uris: [this.redirectUri],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    });

    return this._client;
  }

  async getAccessToken(): Promise<string | null> {
    if (logger.isDebugEnabled()) logger.debug('main getAccessToken');
    const credentials = await this.googleCredentialsService.get(await this.getUserId());
    if (credentials) {
      const expiry = credentials.expiry.getTime();
      const now = this.dateUtil.getCurrentDate().getTime();
      const timedelta = expiry - now;
      if (logger.isDebugEnabled())
        logger.debug({
          now: now,
          expiry: expiry,
          timedelta: timedelta,
        });
      if (timedelta < TOKEN_REFRESH_INTERVAL) {
        if (logger.isDebugEnabled())
          logger.debug('expired!', {
            timedelta: timedelta,
          });
        try {
          const newCredentials = await this.refreshAccessToken(credentials);
          await this.googleCredentialsService.save(newCredentials);
        } catch (e) {
          logger.error(e);
          await this.googleCredentialsService.delete(await this.getUserId());
          return null;
        }
      } else {
        if (logger.isDebugEnabled()) logger.debug('not expired');
      }
      return credentials.accessToken;
    }
    return null;
  }

  private async getAuthUrl(checks: OpenIDCallbackChecks): Promise<string> {
    const client = await this.getClient();

    const code_challenge = checks.code_verifier
      ? generators.codeChallenge(checks.code_verifier)
      : undefined;

    const authorizationUrl = client.authorizationUrl({
      scope: this.scope.join(' '),
      state: checks.state,
      nonce: checks.nonce,
      response_type: 'code',
      code_challenge: code_challenge,
      code_challenge_method: 'S256',
      prompt: 'consent',
    });

    return authorizationUrl;
  }

  private async postAuthenticated(
    url: string,
    checks: OpenIDCallbackChecks
  ): Promise<GoogleCredentials> {
    const client = await this.getClient();
    const param = client.callbackParams(url);
    const tokenSet = await client.callback(this.redirectUri, param, checks);
    if (!tokenSet.access_token || !tokenSet.refresh_token || !tokenSet.expires_at) {
      throw new Error(
        `Missing token properties in the token set. ` +
          `access_token: ${tokenSet.access_token}, ` +
          `refresh_token: ${tokenSet.refresh_token}, ` +
          `expires_at: ${tokenSet.expires_at}`
      );
    }
    const userInfo = await client.userinfo(tokenSet);
    return {
      userId: await this.getUserId(),
      sub: userInfo.sub,
      accessToken: tokenSet.access_token,
      refreshToken: tokenSet.refresh_token,
      expiry: new Date(tokenSet.expires_at),
      updated: this.dateUtil.getCurrentDate(),
    };
  }

  private async refreshAccessToken(credentials: GoogleCredentials): Promise<GoogleCredentials> {
    const client = await this.getClient();
    const refreshResponse = await client.refresh(credentials.refreshToken);
    if (!refreshResponse.access_token || !refreshResponse.expires_at) {
      throw new Error('Token refresh was failed.');
    }
    const newCredentials = {
      ...credentials,
      accessToken: refreshResponse.access_token,
      expiry: new Date(refreshResponse.expires_at),
    };
    return newCredentials;
  }

  async authenticate(): Promise<string> {
    if (logger.isDebugEnabled()) logger.debug(`authenticate`);
    const accessToken = await this.getAccessToken();
    if (accessToken) {
      return accessToken;
    }

    const checks: OpenIDCallbackChecks = {
      state: generators.state(),
      nonce: generators.nonce(),
      code_verifier: generators.codeVerifier(),
    };
    const url = await this.getAuthUrl(checks);

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
        if (url.startsWith(this.redirectUri)) {
          try {
            event.preventDefault();
            const urlObj = new URL(url);
            const token = urlObj.searchParams.get('code');
            if (token) {
              const credentials = await this.postAuthenticated(url, checks);
              await this.googleCredentialsService.save(credentials);
              resolve(token);
            } else {
              reject(new Error('No token found'));
            }
          } catch (e) {
            reject(e);
          } finally {
            this.closeAuthWindow();
          }
        }
      });

      // windowが閉じられたかどうかを確認する
      this.authWindow.on('closed', () => {
        reject(new Error('Window was closed by user'));
      });
    });
  }

  async revoke(): Promise<void> {
    const userId = await this.getUserId();
    const credentials = await this.googleCredentialsService.get(userId);
    if (credentials) {
      await this.googleCredentialsService.delete(userId);
    }
  }

  private closeAuthWindow(): void {
    if (this.authWindow) {
      try {
        this.authWindow.close();
      } catch (e) {
        logger.error(e);
      }
      this.authWindow = undefined;
    }
  }
}
