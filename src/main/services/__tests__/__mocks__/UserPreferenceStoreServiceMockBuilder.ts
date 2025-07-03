import { jest } from '@jest/globals';
import { IUserPreferenceStoreService } from '@main/services/IUserPreferenceStoreService';
import { UserPreference } from '@shared/data/UserPreference';

export class UserPreferenceStoreServiceMockBuilder {
  private get: jest.MockedFunction<() => Promise<UserPreference | undefined>> = jest.fn();
  private create: jest.MockedFunction<() => Promise<UserPreference>> = jest.fn();
  private getOrCreate: jest.MockedFunction<() => Promise<UserPreference>> = jest.fn();
  private save: jest.MockedFunction<(data: UserPreference) => Promise<UserPreference>> = jest.fn();

  withGet(result: UserPreference | undefined): UserPreferenceStoreServiceMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withCreate(result: UserPreference): UserPreferenceStoreServiceMockBuilder {
    this.create.mockResolvedValue(result);
    return this;
  }

  withGetOrCreate(result: UserPreference): UserPreferenceStoreServiceMockBuilder {
    this.getOrCreate.mockResolvedValue(result);
    return this;
  }

  withSave(result: UserPreference): UserPreferenceStoreServiceMockBuilder {
    this.save.mockResolvedValue(result);
    return this;
  }

  build(): IUserPreferenceStoreService {
    const mock: IUserPreferenceStoreService = {
      get: this.get,
      create: this.create,
      getOrCreate: this.getOrCreate,
      save: this.save,
    };
    return mock;
  }
}
