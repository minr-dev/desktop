import { jest } from '@jest/globals';
import { IUserDetailsService } from '@main/services/IUserDetailsService';
import { UserDetails } from '@shared/dto/UserDetails';

export class UserDetailsServiceMockBuilder {
  private get: jest.MockedFunction<() => Promise<UserDetails>> = jest.fn();
  private getUserId: jest.MockedFunction<() => Promise<string>> = jest.fn();

  constructor() {
    this.get.mockResolvedValue({ userId: 'test-user-1' });
  }

  withGetDetails(result: UserDetails): UserDetailsServiceMockBuilder {
    this.get.mockResolvedValue(result);
    return this;
  }

  withGetUserId(result: string): UserDetailsServiceMockBuilder {
    this.getUserId.mockResolvedValue(result);
    return this;
  }

  build(): IUserDetailsService {
    const mock: IUserDetailsService = {
      get: this.get,
      getUserId: this.getUserId,
    };
    return mock;
  }
}
