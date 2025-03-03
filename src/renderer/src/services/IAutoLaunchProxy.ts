export interface IAutoLaunchProxy {
  setAutoLaunchEnabled(isEnabled: boolean): Promise<void>;
}
