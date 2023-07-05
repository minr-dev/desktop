export interface IAuthProxy {
  getAccessToken(): Promise<string | null>;
  authenticate(): Promise<string>;
}
