import { injectable } from 'inversify';
import { IUserDetailsService } from './IUserDetailsService';
import { UserDetails } from '@shared/dto/UserDetails';
import { LOCAL_USER_ID } from '@shared/constants';

@injectable()
export class UserDetailsServiceImpl implements IUserDetailsService {
  async get(): Promise<UserDetails> {
    return {
      userId: LOCAL_USER_ID,
    };
  }
}