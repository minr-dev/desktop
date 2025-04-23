import { BrowserWindow } from 'electron';
import { GitHubCredentials } from '../../shared/data/GitHubCredentials';
import type { ICredentialsStoreService } from './ICredentialsStoreService';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import type { IUserDetailsService } from './IUserDetailsService';
import { BaseClient, DeviceFlowHandle, DeviceFlowPollOptions, Issuer } from 'openid-client';
import { DateUtil } from '@shared/utils/DateUtil';
import { IpcChannel } from '@shared/constants';
import { IpcService } from './IpcService';
import { IDeviceFlowAuthService } from './IDeviceFlowAuthService';
import { getLogger } from '@main/utils/LoggerUtil';

interface GitHubTokenResponse {
  access_token?: string;
  bearer?: string;
  scope?: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
  interval?: number;
}

// minrで必要となる項目のみ記載している
interface GitHubUserInfoResponse {
  id: string;
  login: string;
  [key: string]: unknown;
}

enum GitHubDeviceFlowErrorCode {
  AUTHORIZATION_PENDING = 'authorization_pending',
  SLOW_DOWN = 'slow_down',
  EXPIRED_TOKEN = 'expired_token',
  UNSUPPORTED_GRANT_TYPE = 'unsupported_grant_type',
  INCORRECT_CLIENT_CREDENTIALS = 'incorrect_client_credentials',
  INCORRECT_DEVICE_CODE = 'incorrect_device_code',
  ACCESS_DENIED = 'access_denied',
  DEVICE_FLOW_DISABLED = 'device_flow_disabled',
}

const logger = getLogger('GitHubAuthServiceImpl');

/**
 * GitHub認証を実行するサービス
 *
 * OAuthアプリのクライアントIDのみで認証できる方式であるデバイスフローを実装している。
 *
 * `authenticate()`実行時にGitHubからデバイスコードとユーザーコード、認証URIを取得する。
 * ユーザーコードはIPC通信でrenderer側に渡し、minrの画面に表示する。
 * その後、`authenticate()`はアクセストークンのリクエストのポーリングを行い、
 * アクセストークンが取得できたらローカルに保存して処理を終了する。
 *
 * minrの画面ではユーザーコードの他に`showUserCodeInputWindow()`を呼び出すボタンも表示する。
 * `showUserCodeInputWindow()`では`authenticate()`で取得した認証URIのページを表示するウィンドウを表示する処理を行う。
 * ユーザーはウィンドウでユーザーコードを入力し、認証を行う。
 * 認証URIのページで認証を行った後、`authenticate()`でのリクエストでアクセストークンが取得できるようになり、一連の認証処理が完了する。
 *
 * 認証完了後はアクセストークンだけでGitHubと直接通信する。
 */
@injectable()
export class GitHubAuthServiceImpl implements IDeviceFlowAuthService {
  static readonly TIMER_NAME = 'GitHubAuthServiceImpl';

  private authWindow?: BrowserWindow;
  private verification_uri?: string;
  private _client?: BaseClient;
  private pollingAbortController?: AbortController;

  private scope = ['repo', 'read:user', 'read:org', 'read:project'];

  constructor(
    @inject(TYPES.UserDetailsService)
    private readonly userDetailsService: IUserDetailsService,
    @inject(TYPES.GitHubCredentialsStoreService)
    private readonly githubCredentialsService: ICredentialsStoreService<GitHubCredentials>,
    @inject(TYPES.IpcService)
    private readonly ipcService: IpcService,
    @inject(TYPES.DateUtil)
    private readonly dateUtil: DateUtil
  ) {}

  private async getUserId(): Promise<string> {
    const userDetails = await this.userDetailsService.get();
    return userDetails.userId;
  }

  private get clientId(): string {
    return process.env.GITHUB_CLIENT_ID || GITHUB_CLIENT_ID;
  }

  private async getClient(): Promise<BaseClient> {
    if (this._client != null) {
      return this._client;
    }
    const issuer = new Issuer({
      issuer: 'https://github.com',
      device_authorization_endpoint: 'https://github.com/login/device/code',
      token_endpoint: 'https://github.com/login/oauth/access_token',
      userinfo_endpoint: 'https://api.github.com/user',
    });

    this._client = new issuer.Client({
      client_id: this.clientId,
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    });

    return this._client;
  }

  async getAccessToken(): Promise<string | null> {
    if (logger.isDebugEnabled()) logger.debug('main getAccessToken');
    const credentials = await this.githubCredentialsService.get(
      await this.userDetailsService.getUserId()
    );
    if (credentials) {
      return credentials.accessToken;
    }
    return null;
  }

  private async getDeviceFlowHandle(): Promise<DeviceFlowHandle> {
    const client = await this.getClient();
    return client.deviceAuthorization({ client_id: this.clientId, scope: this.scope.join(' ') });
  }

  /**
   * 本来であれば、openid-clientの`DeviceFlowHandle`の`poll()`でポーリング処理ができる。
   * しかし、GitHubからのエラーレスポンスが200で返ってくるため、そのままでは適切なエラー処理ができない。
   * そのため、ポーリング処理の部分は独自に実装する。
   *
   * 特殊な処理が必要なエラーについて
   * - `autorization_pending`: ユーザーコードが入力待ちの状態。5秒待ってリクエストしなおす。
   * - `slow_down`: リクエストの間隔が狭い場合に返る。間隔をレスポンスの`interval`に設定し、レスポンスにない場合は5秒追加する。
   *
   * @param interval ポーリング間隔(ms)。デフォルトは5秒。
   *
   * @return アクセストークン
   */
  private async pollTokenRequest(
    handle: DeviceFlowHandle,
    interval: number = 5 * 1000,
    options?: DeviceFlowPollOptions
  ): Promise<string> {
    if (handle.expired()) {
      throw new Error('expired!');
    }

    await new Promise<void>((resolve) => {
      // `handle.poll()`の内部で5秒待つ処理があるため、待ち時間を5秒引いてよい
      setTimeout(resolve, Math.min(interval - 5 * 1000, 0));
    });

    // ここの`handle.poll()`はポーリング処理ではなく単にトークンリクエストを送る関数として使っている。
    const tokenSet = (await handle.poll(options)) as GitHubTokenResponse;

    switch (tokenSet.error) {
      case undefined:
        if (tokenSet.access_token) {
          return tokenSet.access_token;
        } else {
          throw new Error('access_token is missing.');
        }
      case GitHubDeviceFlowErrorCode.AUTHORIZATION_PENDING: {
        return this.pollTokenRequest(handle, 5 * 1000, options);
      }
      case GitHubDeviceFlowErrorCode.SLOW_DOWN: {
        const newInterval = tokenSet?.interval ?? interval + 5 * 1000;
        return this.pollTokenRequest(handle, newInterval, options);
      }
      default:
        // `tokenSet`に`error`が含まれる場合、`error_description`や`error_uri`も含まれるはずなので、`tokenSet`をそのまま出力する。
        throw new Error(`${tokenSet}`);
    }
  }

  private async fetchCredentials(handle: DeviceFlowHandle): Promise<GitHubCredentials> {
    this.pollingAbortController = new AbortController();
    const { signal } = this.pollingAbortController;
    // 本来であれば1回目のトークンリクエストの`interval`の値は`client.deviceAuthorization`でのレスポンスの値を用いるのが正しい。
    // しかし、openid-clientの`DeviceFlowHandle`ではこの値がプライベートになっているため、ポーリングを独自に実装するとこれを利用するのが難しい。
    // そのため、デフォルトの5秒を用いる。
    // 仮に`interval`の値が誤っていたとしても、`slow_down`のエラーレスポンスで正しい`interval`が返ってくるので、2回目以降は正しい処理になる
    const interval = 5 * 1000;
    const access_token = await this.pollTokenRequest(handle, interval, { signal });

    this.pollingAbortController = undefined;
    const client = await this.getClient();
    const userinfo = (await client.userinfo(access_token)) as GitHubUserInfoResponse;
    return {
      userId: await this.getUserId(),
      id: userinfo.id,
      login: userinfo.login,
      accessToken: access_token,
      updated: this.dateUtil.getCurrentDate(),
    };
  }

  /**
   * ユーザーコード、デバイスコードの取得、アクセストークンリクエストのポーリングを行う。
   *
   * @returns アクセストークン
   */
  async authenticate(): Promise<string> {
    if (logger.isDebugEnabled()) logger.debug(`authenticate`);

    // ポーリング処理が行われている場合は、それを中断する
    await this.abortPolling();

    const accessToken = await this.getAccessToken();
    if (accessToken) {
      return accessToken;
    }

    const handle = await this.getDeviceFlowHandle();
    this.verification_uri = handle.verification_uri;
    // rendererにユーザーコードを送る
    this.ipcService.send(IpcChannel.GITHUB_USER_CODE_NOTIFY, handle.user_code);

    try {
      const credentials = await this.fetchCredentials(handle);
      await this.githubCredentialsService.save(credentials);
      return credentials.accessToken;
    } finally {
      this.verification_uri = undefined;
      this.closeAuthWindow();
    }
  }

  showUserCodeInputWindow(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.verification_uri) {
        reject(new Error(`verification_uri was not found.`));
        return;
      }
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

      this.authWindow.loadURL(this.verification_uri);
      this.authWindow.show();

      if (this.pollingAbortController) {
        this.pollingAbortController.signal.addEventListener('abort', () => {
          this.closeAuthWindow();
        });
      }

      // windowが閉じられたかどうかを確認する
      this.authWindow.on('closed', () => {
        resolve();
      });
    });
  }

  async abortPolling(): Promise<void> {
    if (this.pollingAbortController) {
      this.pollingAbortController.abort();
      this.pollingAbortController = undefined;
    }
  }

  async revoke(): Promise<void> {
    const userId = await this.getUserId();
    const credentials = await this.githubCredentialsService.get(userId);
    if (credentials) {
      await this.githubCredentialsService.delete(userId);
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
