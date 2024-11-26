export interface IDeviceFlowAuthService {
  getAccessToken(): Promise<string | null>;
  authenticate(): Promise<string>;
  showUserCodeInputWindow(): Promise<void>;
  revoke(): Promise<void>;
}
