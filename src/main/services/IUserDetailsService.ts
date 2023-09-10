import { UserDetails } from '@shared/dto/UserDetails';

export interface IUserDetailsService {
  get(): Promise<UserDetails>;
  getUserId(): Promise<string>;
}
