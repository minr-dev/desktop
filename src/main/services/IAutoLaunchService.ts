export interface IAutoLaunchService {
  setAutoLaunchEnabled(isEnabled: boolean): Promise<void>;
}
