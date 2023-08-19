import { UserDetails } from '../UserDetails';

export class UserDetailsFixture {
  static default(override: Partial<UserDetails> = {}): UserDetails {
    return {
      userId: 'user123',
      ...override,
    };
  }
}
