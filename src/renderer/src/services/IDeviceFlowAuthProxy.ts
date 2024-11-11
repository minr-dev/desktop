export interface IDeviceFlowAuthProxy {
  getAccessToken(): Promise<string | null>;
  authenticate(): Promise<string>;
  showUserCodeInputWindow(): Promise<void>;
  revoke(): Promise<void>;
}
