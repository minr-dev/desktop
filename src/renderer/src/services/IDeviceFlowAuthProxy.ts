export interface IDeviceFlowAuthProxy {
  getAccessToken(): Promise<string | null>;
  authenticate(): Promise<string>;
  showUserCodeInputWindow(): Promise<void>;
  abortPolling(): Promise<void>;
  revoke(): Promise<void>;
}
