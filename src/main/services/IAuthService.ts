export interface IAuthService {
  authenticate(): Promise<string>;
  revoke(): Promise<void>;
}
