import { UserPreference } from '@shared/dto/UserPreference';

export interface IUserPreferenceStoreService {
  get(): Promise<UserPreference | undefined>;
  create(): Promise<UserPreference>;
  getOrCreate(): Promise<UserPreference>;
  save(data: UserPreference): Promise<void>;
}
