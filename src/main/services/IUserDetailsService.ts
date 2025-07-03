import { UserDetails } from '@shared/data/UserDetails';

export interface IUserDetailsService {
  get(): Promise<UserDetails>;
  getUserId(): Promise<string>;
}
