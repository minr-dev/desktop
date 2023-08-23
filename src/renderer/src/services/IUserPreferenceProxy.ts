import { UserPreference } from '@shared/dto/UserPreference';

export interface IUserPreferenceProxy {
  get(userId: string): Promise<UserPreference | undefined>;
  create(userId: string): Promise<UserPreference>;
  getOrCreate(userId: string): Promise<UserPreference>;
  save(userPreference: UserPreference): Promise<UserPreference>;
}
