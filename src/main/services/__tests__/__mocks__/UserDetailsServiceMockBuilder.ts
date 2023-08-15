import { jest } from '@jest/globals';
import { IUserDetailsService } from '@main/services/IUserDetailsService';
import { UserDetails } from '@shared/dto/UserDetails';

export class UserDetailsServiceMockBuilder {
  private getDetails: jest.MockedFunction<() => Promise<UserDetails>> = jest.fn();

  constructor() {
    this.getDetails.mockResolvedValue({ userId: 'test-user-1' });
  }

  withGetDetails(result: UserDetails): UserDetailsServiceMockBuilder {
    this.getDetails.mockResolvedValue(result);
    return this;
  }

  build(): IUserDetailsService {
    const mock: IUserDetailsService = {
      get: this.getDetails,
    };
    return mock;
  }
}
