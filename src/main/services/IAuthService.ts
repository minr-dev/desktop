export interface IAuthService {
  authenticate(): Promise<string>;
}
