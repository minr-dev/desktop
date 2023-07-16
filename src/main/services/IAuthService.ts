export interface IAuthService {
  getAccessToken(): Promise<string | null>;
  authenticate(): Promise<string>;
  revoke(): Promise<void>;
}
