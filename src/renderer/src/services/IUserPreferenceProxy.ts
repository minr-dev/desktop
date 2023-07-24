import { UserPreference } from '@shared/dto/UserPreference';

export interface IUserPreferenceProxy {
  get(): Promise<UserPreference | undefined>;
  getOrCreate(): Promise<UserPreference>;
  save(userPreference: UserPreference): Promise<UserPreference>;
}
