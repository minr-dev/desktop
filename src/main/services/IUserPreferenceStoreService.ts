import { UserPreference } from '@shared/data/UserPreference';

export interface IUserPreferenceStoreService {
  get(id: string): Promise<UserPreference | undefined>;
  create(id: string): Promise<UserPreference>;
  getOrCreate(id: string): Promise<UserPreference>;
  save(data: UserPreference): Promise<UserPreference>;
}
